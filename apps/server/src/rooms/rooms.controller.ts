// src/rooms/rooms.controller.ts
import { Body, Controller, Post, Get, Delete, Param } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/rooms.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // 채팅방 생성
  @Post('create')
  async create(@Body() createRoomDto: CreateRoomDto) {
    return await this.roomsService.createRoom(createRoomDto);
  }

  // 모든 채팅방 조회
  @Get()
  async getAllRooms() {
    return await this.roomsService.getAllRooms();
  }

  // 특정 채팅방 조회
  @Get(':uuid')
  async getRoomById(@Param('uuid') uuid: string) {
    return await this.roomsService.getRoomById(uuid);
  }

  // 채팅방 삭제
  @Delete(':uuid')
  async deleteRoom(@Param('uuid') uuid: string) {
    return await this.roomsService.deleteRoom(uuid);
  }
}
