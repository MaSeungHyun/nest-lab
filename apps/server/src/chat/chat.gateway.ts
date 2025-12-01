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

@WebSocketGateway({
  cors: {
    origin: '*', // 개발 중에는 *, 프로덕션에서는 특정 도메인
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  // 클라이언트 연결 시
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // 클라이언트 연결 해제 시
  handleDisconnect(client: Socket) {
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
  handleJoinRoom(
    @MessageBody() data: { roomId: string; userId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, userName } = data;

    // Socket을 특정 room에 조인
    client.join(roomId);

    this.logger.log(`User ${userName} joined room ${roomId}`);

    // 같은 방의 다른 사용자들에게 알림
    client.to(roomId).emit('userJoined', {
      userId,
      type: 'join',
      userName,
      message: `${userName}님이 입장했습니다.`,
    });
  }

  // 메시지 전송
  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody()
    data: {
      roomId: string;
      userId: string;
      userName: string;
      message: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, userName, message } = data;

    const messageData = {
      id: Date.now().toString(),
      type: 'message',
      userId,
      userName,
      message,
      createdAt: new Date().toISOString(),
    };

    // 같은 방의 모든 사용자(본인 포함)에게 전송
    this.server.to(roomId).emit('newMessage', messageData);

    this.logger.log(`Message in room ${roomId}: ${message}`);
  }

  // 채팅방 퇴장
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userName } = data;

    client.leave(roomId);

    // 다른 사용자들에게 알림
    client.to(roomId).emit('userLeft', {
      type: 'leave',
      userName,
      message: `${userName}님이 퇴장했습니다.`,
    });
  }
}
