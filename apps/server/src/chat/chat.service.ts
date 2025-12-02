// apps/server/src/chat/chat.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomUser } from './entities/room-user.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(RoomUser)
    private roomUserRepository: Repository<RoomUser>,
  ) {}

  /**
   * 방에 사용자 입장 정보 저장
   */
  async joinRoom(
    roomId: string,
    userId: string,
    userName: string,
  ): Promise<RoomUser> {
    // 이미 입장한 경우 업데이트, 없으면 생성
    let roomUser = await this.roomUserRepository.findOne({
      where: { roomId, userId },
    });

    if (roomUser) {
      // 이미 입장한 경우 업데이트 시간만 갱신
      roomUser.updatedAt = new Date();
      roomUser = await this.roomUserRepository.save(roomUser);
      this.logger.log(
        `User ${userName} already in room ${roomId}, updated timestamp`,
      );
    } else {
      // 새로 입장
      roomUser = this.roomUserRepository.create({
        roomId,
        userId,
        userName,
      });
      roomUser = await this.roomUserRepository.save(roomUser);
      this.logger.log(`User ${userName} joined room ${roomId} (saved to DB)`);
    }

    return roomUser;
  }

  /**
   * 방에서 사용자 퇴장 정보 삭제
   */
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    const result = await this.roomUserRepository.delete({ roomId, userId });
    if (result.affected && result.affected > 0) {
      this.logger.log(`User ${userId} left room ${roomId} (removed from DB)`);
    } else {
      this.logger.warn(
        `User ${userId} not found in room ${roomId} for removal`,
      );
    }
  }

  /**
   * 방의 모든 접속자 목록 조회
   */
  async getRoomUsers(roomId: string): Promise<RoomUser[]> {
    const users = await this.roomUserRepository.find({
      where: { roomId },
      order: { joinedAt: 'ASC' },
    });
    this.logger.log(`Found ${users.length} users in room ${roomId}`);
    return users;
  }

  /**
   * 방의 접속자 목록 조회 (최대 3명)
   */
  async getRoomUsersLimited(
    roomId: string,
    limit: number = 3,
  ): Promise<RoomUser[]> {
    const users = await this.roomUserRepository.find({
      where: { roomId },
      order: { joinedAt: 'ASC' },
      take: limit, // 최대 개수 제한
    });
    this.logger.log(
      `Found ${users.length} users (limited to ${limit}) in room ${roomId}`,
    );
    return users;
  }

  /**
   * 특정 사용자가 방에 있는지 확인
   */
  async isUserInRoom(roomId: string, userId: string): Promise<boolean> {
    const count = await this.roomUserRepository.count({
      where: { roomId, userId },
    });
    return count > 0;
  }

  /**
   * 방의 접속자 수 조회
   */
  async getRoomUserCount(roomId: string): Promise<number> {
    return await this.roomUserRepository.count({ where: { roomId } });
  }
}
