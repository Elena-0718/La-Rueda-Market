import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<any>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('El token es requerido.');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido.');
    }

    try {
      const payload = this.jwtService.verify(token);

      if (!payload?.sub) {
        throw new UnauthorizedException(
          'Token inválido: falta el ID del usuario.',
        );
      }

      request.user = {
        userId: payload.sub,
        uuid: payload.sub,
        credentialId: payload.credential_uuid,
        credential_uuid: payload.credential_uuid,
        phone: payload.phone,
        role: payload.role,
      };

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('El token ha expirado.');
      }

      throw new UnauthorizedException('Token inválido.');
    }
  }
}