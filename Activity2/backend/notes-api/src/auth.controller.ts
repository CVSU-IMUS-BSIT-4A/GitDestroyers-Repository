import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: AuthRegisterDto) {
    return await this.auth.register(dto);
  }

  @Post('login')
  async login(@Body() dto: AuthLoginDto) {
    return await this.auth.login(dto);
  }
}
