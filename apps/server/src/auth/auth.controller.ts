import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { id: string; password: string }) {
    const { id, password } = body;

    return this.authService.login(id, password);
  }
}
