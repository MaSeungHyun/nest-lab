import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(id: string, password: string) {
    if (id === 'grapicar' && password === '1111') {
      return {
        success: true,
        redirectUrl: '/dashboard',
        message: '로그인 성공',
      };
    }
    return {
      success: false,
      message: '아이디 또는 비밀번호가 올바르지 않습니다.',
    };
  }
}
