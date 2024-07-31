/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async register(createUserDto: Prisma.UserCreateInput) {
    try {
      const hashPassword = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password = hashPassword;
      createUserDto.role = Role.user;
      const user = await this.prisma.user.create({ data: createUserDto });
      const { password, ...rest } = user;
      return rest;
    } catch (err) {
      throw new Error(`Error creating ${err} user ${err.message}`);
    }
  }
  async findOne(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      const isMatch = await bcrypt.compare(password, user.password);
      if (user && isMatch) {
        return user;
      } else {
        throw new Error(`User not found`);
      }
    } catch (err) {
      throw new Error(`Error finding ${err} user ${err.message}`);
    }
  }
  async getAll() {
    return await this.prisma.user.findMany({
      where: { role: 'user' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
        createdAt: true,
      },
    });
  }
}
