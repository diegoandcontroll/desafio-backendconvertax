import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

import { Public } from './publicRoutes/public';
import type { Prisma } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @Post('/signup')
  @ApiOperation({
    summary: 'Sign Up as a user',
  })
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.authService.signup(createUserDto);
  }

  @ApiOperation({
    summary: 'Login as a user',
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
