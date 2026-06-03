import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CredentialRepository } from './credential.repository';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { VerifyResetCodeDto } from './dtos/verify-reset-code.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { Roles } from '../enum/roles.enum';
import { ChangeRoleDto } from './dtos/change-role.dto';

@Injectable()
export class CredentialService {
  constructor(
    private readonly credentialRepository: CredentialRepository,
  ) {}

  async getAllCredentialsService() {
    return this.credentialRepository.getAllCredentialsRepository();
  }

  async getCredentialByIdService(uuid: string) {
    const credential =
      await this.credentialRepository.getCredentialByIdRepository(uuid);

    if (!credential) {
      throw new NotFoundException('Credencial no encontrada.');
    }

    return credential;
  }

  async getCredentialByPhoneService(phone: string) {
    const credential =
      await this.credentialRepository.getCredentialByPhoneRepository(phone);

    if (!credential) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return credential;
  }

  async patchChangePasswordService(
    uuid: string,
    dto: ChangePasswordDto,
    userLogged: any,
  ) {
    const credential =
      await this.credentialRepository.getCredentialByIdRepository(uuid);

    if (!credential) {
      throw new NotFoundException('Credencial no encontrada.');
    }

    if (!credential.isActive) {
      throw new ConflictException('La cuenta está desactivada.');
    }

    if (
      userLogged.role !== Roles.ADMIN &&
      userLogged.credential_uuid !== uuid
    ) {
      throw new UnauthorizedException('No autorizado.');
    }

    const credentialWithPassword =
      await this.credentialRepository.getCredentialByPhoneRepository(
        credential.phone,
      );

    if (!credentialWithPassword) {
      throw new NotFoundException('Credencial no encontrada.');
    }

    const isValidPassword = await bcrypt.compare(
      dto.currentPassword,
      credentialWithPassword.password,
    );

    if (!isValidPassword) {
      throw new BadRequestException('Contraseña actual incorrecta.');
    }

    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    return this.credentialRepository.patchChangePasswordRepository(
      credentialWithPassword,
      hashedPassword,
    );
  }

  async deleteCredentialService(uuid: string, userLogged: any) {
    const credential =
      await this.credentialRepository.getCredentialByIdRepository(uuid);

    if (!credential) {
      throw new NotFoundException('Credencial no encontrada.');
    }

    if (
      userLogged.role !== Roles.ADMIN &&
      userLogged.credential_uuid !== uuid
    ) {
      throw new UnauthorizedException('No autorizado.');
    }

    if (!credential.isActive) {
      throw new ConflictException('La cuenta ya está desactivada.');
    }

    return this.credentialRepository.deactivateCredentialAndUserRepository(
      credential,
    );
  }

  async activateCredentialService(uuid: string) {
    const credential =
      await this.credentialRepository.getCredentialByIdRepository(uuid);

    if (!credential) {
      throw new NotFoundException('Credencial no encontrada.');
    }

    if (credential.isActive) {
      throw new ConflictException('La cuenta ya está activa.');
    }

    return this.credentialRepository.activateCredentialAndUserRepository(
      credential,
    );
  }

  async putChangeUserRole(uuid: string, dto: ChangeRoleDto) {
    const credential =
      await this.credentialRepository.getCredentialByIdRepository(uuid);

    if (!credential) {
      throw new NotFoundException('Credencial no encontrada.');
    }

    if (credential.role === dto.role) {
      throw new ConflictException('El usuario ya tiene ese rol.');
    }

    return this.credentialRepository.putChangeUserRoleRepository(
      credential,
      dto,
    );
  }

  async forgotPasswordService(dto: ForgotPasswordDto) {
    const credential =
      await this.credentialRepository.getCredentialByPhoneRepository(
        dto.phone,
      );

    if (!credential) {
      return {
        message:
          'Si el celular está registrado, recibirás un código de recuperación.',
      };
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const resetCodeExpiresAt = new Date();
    resetCodeExpiresAt.setMinutes(resetCodeExpiresAt.getMinutes() + 10);

    await this.credentialRepository.saveResetCodeRepository(
      credential,
      resetCode,
      resetCodeExpiresAt,
    );

    /*
      Aquí luego conectas SMS o WhatsApp.
      Por ahora retornamos el código para pruebas en desarrollo.
      En producción NO debes retornar resetCode.
    */

    return {
      message: 'Código de recuperación generado correctamente.',
      resetCode,
    };
  }

  async verifyResetCodeService(dto: VerifyResetCodeDto) {
    const credential =
      await this.credentialRepository.getCredentialByPhoneRepository(
        dto.phone,
      );

    if (!credential || !credential.resetCode) {
      throw new BadRequestException('Código inválido o expirado.');
    }

    if (credential.resetCode !== dto.code) {
      throw new BadRequestException('Código inválido.');
    }

    if (
      !credential.resetCodeExpiresAt ||
      credential.resetCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('El código ha expirado.');
    }

    return {
      message: 'Código verificado correctamente.',
    };
  }

  async resetPasswordService(dto: ResetPasswordDto) {
    const credential =
      await this.credentialRepository.getCredentialByPhoneRepository(
        dto.phone,
      );

    if (!credential || !credential.resetCode) {
      throw new BadRequestException('Código inválido o expirado.');
    }

    if (credential.resetCode !== dto.code) {
      throw new BadRequestException('Código inválido.');
    }

    if (
      !credential.resetCodeExpiresAt ||
      credential.resetCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('El código ha expirado.');
    }

    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    return this.credentialRepository.patchChangePasswordRepository(
      credential,
      hashedPassword,
    );
  }
}