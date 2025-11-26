// src/rooms/rooms.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/rooms.entity';
import { CreateRoomDto } from './dto/rooms.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  // 채팅방 생성
  async createRoom(createRoomDto: CreateRoomDto) {
    const { name } = createRoomDto;

    // 이미 존재하는 채팅방인지 확인
    const existingRoom = await this.roomRepository.findOne({
      where: { name: name },
    });

    if (existingRoom) {
      throw new ConflictException('이미 존재하는 채팅방 이름입니다.');
    }

    // 새 채팅방 생성
    const room = this.roomRepository.create({
      name: name,
    });

    await this.roomRepository.save(room);

    return {
      success: true,
      message: '채팅방 생성 성공',
      room: {
        uuid: room.uuid,
        name: room.name,
        createdAt: room.created_at,
      },
    };
  }

  // 모든 채팅방 조회
  async getAllRooms() {
    const rooms = await this.roomRepository.find({
      order: { created_at: 'DESC' },
    });

    return {
      success: true,
      count: rooms.length,
      rooms: rooms.map((room) => ({
        uuid: room.uuid,
        name: room.name,
        createdAt: room.created_at,
      })),
    };
  }

  // 특정 채팅방 조회
  async getRoomById(uuid: string) {
    const room = await this.roomRepository.findOne({
      where: { uuid: uuid },
    });

    if (!room) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다.');
    }

    return {
      success: true,
      room: {
        uuid: room.uuid,
        name: room.name,
        createdAt: room.created_at,
      },
    };
  }

  // 채팅방 삭제
  async deleteRoom(uuid: string) {
    const room = await this.roomRepository.findOne({
      where: { uuid: uuid },
    });

    if (!room) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다.');
    }

    await this.roomRepository.remove(room);

    return {
      success: true,
      message: '채팅방이 삭제되었습니다.',
    };
  }
}
