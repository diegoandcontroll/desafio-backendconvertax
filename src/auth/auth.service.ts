/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    return await this.usersService.findOne(email, password);
  }
  async signup(createUserDto: Prisma.UserCreateInput) {
    try {
      return await this.usersService.register(createUserDto);
    } catch (err) {
      throw new Error(`Error creating ${err} user ${err.message}`);
    }
  }
  async signin(email: string, password: string) {
    try {
      const user = (await this.validateUser(
        email,
        password,
      )) as Prisma.UserCreateInput;
      const payload = { email: user.email, sub: user.id, role: user.role };
      return {
        user: {
          id: user.id,
          username: user.name,
          email: user.email,
          role: user.role,
        },
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new Error(`Error logging in ${error} user ${error.message}`);
    }
  }
}
