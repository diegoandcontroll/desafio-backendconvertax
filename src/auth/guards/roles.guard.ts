import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../enums/role.enum';
import { ROLES_KEY } from '../decorator/role.decorator';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from 'src/constants/constants';
import { IS_PUBLIC_KEY } from '../publicRoutes/public';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest() as Request;

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    if (!requiredRoles) {
      return true;
    }

    try {
      const user = jwt.verify(token, jwtConstants.secret) as any;
      return requiredRoles.some((role) => user.role?.includes(role));
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
