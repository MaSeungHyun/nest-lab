// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import {
  SignUpRequestDto,
  SignInRequestDto,
} from '../../../types/common/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signIn(signinDto: SignInRequestDto) {
    const { id, password } = signinDto;

    // 유저 찾기
    const user = await this.userRepository.findOne({
      where: { id: id },
      select: ['uuid', 'id', 'password'],
    });

    if (!user) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    // 비밀번호 확인 (실제 프로덕션에서는 bcrypt.compare 사용)
    if (user.password !== password) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return {
      success: true,
      redirectUrl: '/dashboard',
      message: '로그인 성공',
      user: {
        uuid: user.uuid,
        id: user.id,
      },
    };
  }

  async signUp(signupDto: SignUpRequestDto) {
    const { id, password } = signupDto;

    console.log(id, password);

    // 이미 존재하는 유저인지 확인
    const existingUser = await this.userRepository.findOne({
      where: { id: id },
    });

    if (existingUser) {
      throw new ConflictException('이미 존재하는 아이디입니다.');
    }

    // 새 유저 생성
    const user = this.userRepository.create({
      id: id,
      password, // 실제 프로덕션에서는 bcrypt 등으로 암호화 필요
    });

    await this.userRepository.save(user);

    return {
      success: true,
      message: '회원가입 성공',
      user: {
        uuid: user.uuid,
        id: user.id,
      },
    };
  }
}
