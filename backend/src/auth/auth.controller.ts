import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from '../credential/dtos/login.dto';
import { SignUpDto } from '../credential/dtos/sign-up.dto';


@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con celular' })
  @ApiBody({ type: LoginDto })
  login(@Body() loginDto: LoginDto) {
    return this.authService.signInService(loginDto);
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar cliente' })
  @ApiBody({ type: SignUpDto })
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUpService(signUpDto);
  }
}