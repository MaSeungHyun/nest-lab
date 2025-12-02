import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RoomUser } from './entities/room-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomUser])],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
