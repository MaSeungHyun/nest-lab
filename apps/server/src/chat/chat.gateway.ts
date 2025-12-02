// apps/server/src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*', // 개발 중에는 *, 프로덕션에서는 특정 도메인
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {}

  // 클라이언트 연결 시
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // 접속 이벤트는 joinRoom에서 처리 (roomId 정보 필요)
  }

  // 클라이언트 연결 해제 시
  async handleDisconnect(client: Socket) {
    const socketData = client.data as
      | { userId?: string; userName?: string; roomId?: string }
      | undefined;

    if (socketData?.userId && socketData?.roomId) {
      try {
        // DB에서 입장 정보 삭제
        await this.chatService.leaveRoom(socketData.roomId, socketData.userId);

        // 같은 방의 다른 사용자들에게 알림
        this.server.to(socketData.roomId).emit('userLeft', {
          type: 'leave',
          userName: socketData.userName || 'Unknown',
          userId: socketData.userId,
          message: `${socketData.userName || 'Unknown'}님이 퇴장했습니다.`,
        });

        this.logger.log(
          `User ${socketData.userId} disconnected and removed from room ${socketData.roomId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error handling disconnect for user ${socketData.userId}:`,
          error,
        );
      }
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // 테스트용 핑-퐁
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    this.logger.log(`Ping from ${client.id}`);
    return { event: 'pong', data: 'pong' };
  }

  // 사용자가 채팅방에 입장
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string; userId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, userName } = data;

    try {
      // 1. DB에 입장 정보 저장
      await this.chatService.joinRoom(roomId, userId, userName);

      // 2. Socket을 특정 room에 조인
      void client.join(roomId);

      // 3. 새로 입장한 사용자의 소켓에 사용자 정보 저장
      client.data = { userId, userName, roomId };

      this.logger.log(`User ${userName} joined room ${roomId}`);

      // 3-1. 접속 이벤트 전송 (모든 클라이언트에게)
      this.server.emit('userConnected', {
        userId,
        userName,
        roomId,
        message: `${userName}님이 접속했습니다.`,
      });

      // 4. DB에서 방의 접속자 목록 조회 (최대 3명)
      const roomUsers = await this.chatService.getRoomUsersLimited(roomId, 3);

      // 5. 본인을 제외한 사용자 목록 생성
      const currentUsers = roomUsers
        .filter((ru) => ru.userId !== userId)
        .map((ru) => ({
          userId: ru.userId,
          userName: ru.userName,
        }));

      // 6. 새로 입장한 사용자에게 현재 접속자 목록 전송 (DB에서 조회한 목록)
      client.emit('roomUsers', {
        users: currentUsers,
      });

      this.logger.log(
        `📤 [Server] Sent ${currentUsers.length} current users from DB to ${userName}`,
      );

      // 7. 같은 방의 다른 사용자들에게 알림 (접속자 3명 포함)
      const roomUsersForBroadcast = await this.chatService.getRoomUsersLimited(
        roomId,
        3,
      );
      const usersForBroadcast = roomUsersForBroadcast.map((ru) => ({
        userId: ru.userId,
        userName: ru.userName,
      }));

      client.to(roomId).emit('userJoined', {
        userId,
        type: 'join',
        userName,
        message: `${userName}님이 입장했습니다.`,
        users: usersForBroadcast, // 접속자 3명 포함
      });
    } catch (error) {
      this.logger.error(
        `Error handling joinRoom for ${userName} in ${roomId}:`,
        error,
      );
      // 에러 발생 시에도 소켓 조인은 진행 (실시간 통신은 유지)
      void client.join(roomId);
      client.data = { userId, userName };
    }
  }

  // 메시지 전송
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: {
      roomId: string;
      userId: string;
      userName: string;
      message: string;
    },
  ) {
    const { roomId, userId, userName, message } = data;

    // 방의 접속자 3명 조회
    const roomUsers = await this.chatService.getRoomUsersLimited(roomId, 3);
    const users = roomUsers.map((ru) => ({
      userId: ru.userId,
      userName: ru.userName,
    }));

    const messageData = {
      id: Date.now().toString(),
      type: 'message',
      userId,
      userName,
      message,
      createdAt: new Date().toISOString(),
      users, // 접속자 3명 포함
    };

    // 같은 방의 모든 사용자(본인 포함)에게 전송
    this.server.to(roomId).emit('newMessage', messageData);

    this.logger.log(`Message in room ${roomId}: ${message}`);
  }

  // 채팅방 퇴장
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { roomId: string; userName: string; userId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userName, userId } = data;
    const socketData = client.data as { userId?: string } | undefined;
    const actualUserId = userId || socketData?.userId;

    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.log(`📥 [Server] Received leaveRoom from client: ${client.id}`);
    this.logger.log(`Room ID: ${roomId}`);
    this.logger.log(`User Name: ${userName}`);
    this.logger.log(`User ID: ${actualUserId || 'not provided'}`);

    try {
      // 1. DB에서 입장 정보 삭제
      if (actualUserId) {
        await this.chatService.leaveRoom(roomId, actualUserId);
        this.logger.log(
          `✅ [Server] Removed user ${actualUserId} from room ${roomId} in DB`,
        );
      } else {
        this.logger.warn(
          `⚠️ [Server] No userId provided, cannot remove from DB`,
        );
      }

      // 2. Socket에서 방 나가기
      void client.leave(roomId);
      this.logger.log(`✅ [Server] Client ${client.id} left room ${roomId}`);

      // 3. 소켓 데이터에서 roomId 제거
      if (client.data) {
        const socketData = client.data as { roomId?: string };
        delete socketData.roomId;
      }

      // 4. 방의 접속자 3명 조회
      const roomUsers = await this.chatService.getRoomUsersLimited(roomId, 3);
      const users = roomUsers.map((ru) => ({
        userId: ru.userId,
        userName: ru.userName,
      }));

      this.logger.log(
        `📊 [Server] Current users in room ${roomId}: ${users.length}`,
      );

      // 5. 다른 사용자들에게 알림 (접속자 3명 포함)
      const roomSockets = this.server.sockets.adapter.rooms.get(roomId);
      const roomSize = roomSockets ? roomSockets.size : 0;
      this.logger.log(
        `📤 [Server] Broadcasting userLeft to ${roomSize} clients in room ${roomId}`,
      );

      client.to(roomId).emit('userLeft', {
        type: 'leave',
        userName,
        userId: actualUserId,
        message: `${userName}님이 퇴장했습니다.`,
        users, // 접속자 3명 포함
      });

      this.logger.log(`✅ [Server] userLeft event broadcasted for ${userName}`);
      this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
      this.logger.error(
        `❌ [Server] Error handling leaveRoom for ${userName} in ${roomId}:`,
        error,
      );
      // 에러 발생 시에도 소켓 퇴장은 진행
      void client.leave(roomId);
    }
  }

  // Transform 업데이트 (에디터 오브젝트 변환)
  @SubscribeMessage('transformUpdate')
  async handleTransformUpdate(
    @MessageBody()
    data: {
      name: string;
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
      quaternion: { x: number; y: number; z: number; w: number };
      scale: { x: number; y: number; z: number };
      mode?: string;
      roomId?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.log(
      `📥 [Server] Received transformUpdate from client: ${client.id}`,
    );
    this.logger.log(`Object Name: ${data.name}`);
    this.logger.log(`Position: ${JSON.stringify(data.position)}`);
    this.logger.log(`Rotation: ${JSON.stringify(data.rotation)}`);
    this.logger.log(`Scale: ${JSON.stringify(data.scale)}`);
    this.logger.log(`Mode: ${data.mode || 'N/A'}`);

    // roomId 가져오기 (data에서 또는 client.data에서)
    const socketData = client.data as { roomId?: string } | undefined;
    const roomId = data.roomId || socketData?.roomId;

    // 방의 접속자 3명 조회 (roomId가 있는 경우)
    let users: Array<{ userId: string; userName: string }> = [];
    if (roomId) {
      const roomUsers = await this.chatService.getRoomUsersLimited(roomId, 3);
      users = roomUsers.map((ru) => ({
        userId: ru.userId,
        userName: ru.userName,
      }));
    }

    // 본인을 제외한 모든 클라이언트에게 브로드캐스트 (접속자 3명 포함)
    const transformDataWithUsers = {
      ...data,
      users, // 접속자 3명 포함
    };

    const connectedClients = this.server.sockets.sockets.size;
    this.logger.log(
      `📤 [Server] Broadcasting to ${connectedClients - 1} other clients`,
    );

    client.broadcast.emit('transformUpdate', transformDataWithUsers);

    this.logger.log(`✅ [Server] Broadcast complete for object: ${data.name}`);
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}
