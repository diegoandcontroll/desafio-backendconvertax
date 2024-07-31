import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

import { Public } from './publicRoutes/public';
import type { Prisma } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @Post('/signup')
  @ApiOperation({
    summary: 'Signup as a user',
  })
  @ApiBody({
    description: 'SignUp creation payload',
    schema: {
      example: {
        name: 'Jhon Doe',
        email: 'email@email.com',
        password: 'password',
      },
    },
  })
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.authService.signup(createUserDto);
  }

  @ApiOperation({
    summary: 'Login as a user',
  })
  @ApiBody({
    description: 'SignUp creation payload',
    schema: {
      example: {
        email: 'email@email.com',
        password: 'password',
      },
    },
  })
  @Public()
  @Post('/signin')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.authService.signin(email, password);
  }
}
