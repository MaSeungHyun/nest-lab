// apps/server/src/chat/entities/room-user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('room_users')
@Index(['roomId', 'userId'], { unique: true }) // 같은 방에 같은 사용자가 중복 입장 방지
export class RoomUser {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'uuid' })
  @Index()
  roomId: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column()
  userName: string;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

