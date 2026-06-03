import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Credential } from '../entities/credential.entity';
import { User } from '../entities/users.entity';
import { ChangeRoleDto } from './dtos/change-role.dto';


@Injectable()
export class CredentialRepository {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepo: Repository<Credential>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getCredentialByPhoneRepository(
    phone: string,
  ): Promise<Credential | null> {
    return this.credentialRepo
      .createQueryBuilder('credential')
      .addSelect('credential.password')
      .addSelect('credential.refreshToken')
      .addSelect('credential.resetCode')
      .addSelect('credential.resetCodeExpiresAt')
      .where('credential.phone = :phone', { phone })
      .leftJoinAndSelect('credential.user', 'user')
      .getOne();
  }

  async getCredentialByIdRepository(
    uuid: string,
  ): Promise<Credential | null> {
    return this.credentialRepo.findOne({
      where: { uuid },
      relations: ['user'],
    });
  }

  async getAllCredentialsRepository(): Promise<Credential[]> {
    return this.credentialRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async postCreateCredentialRepository(
    data: Partial<Credential>,
  ): Promise<Credential> {
    const credential = this.credentialRepo.create(data);
    return this.credentialRepo.save(credential);
  }

  async patchChangePasswordRepository(
    credential: Credential,
    hashedPassword: string,
  ): Promise<{ message: string }> {
    credential.password = hashedPassword;
    credential.resetCode = null;
    credential.resetCodeExpiresAt = null;

    await this.credentialRepo.save(credential);

    return {
      message: 'Contraseña actualizada correctamente.',
    };
  }

  async putChangeUserRoleRepository(
    credential: Credential,
    dto: ChangeRoleDto,
  ): Promise<{ message: string }> {
    credential.role = dto.role;

    await this.credentialRepo.save(credential);

    return {
      message: 'Rol actualizado correctamente.',
    };
  }

  async deactivateCredentialAndUserRepository(
    credential: Credential,
  ): Promise<{ message: string }> {
    credential.isActive = false;
    await this.credentialRepo.save(credential);

    if (credential.user) {
      credential.user.isActive = false;
      await this.userRepo.save(credential.user);
    }

    return {
      message: 'Cuenta desactivada correctamente.',
    };
  }

  async activateCredentialAndUserRepository(
    credential: Credential,
  ): Promise<{ message: string }> {
    credential.isActive = true;
    await this.credentialRepo.save(credential);

    if (credential.user) {
      credential.user.isActive = true;
      await this.userRepo.save(credential.user);
    }

    return {
      message: 'Cuenta activada correctamente.',
    };
  }

  async saveResetCodeRepository(
    credential: Credential,
    resetCode: string,
    resetCodeExpiresAt: Date,
  ): Promise<void> {
    credential.resetCode = resetCode;
    credential.resetCodeExpiresAt = resetCodeExpiresAt;

    await this.credentialRepo.save(credential);
  }

  async clearResetCodeRepository(
    credential: Credential,
  ): Promise<void> {
    credential.resetCode = null;
    credential.resetCodeExpiresAt = null;

    await this.credentialRepo.save(credential);
  }
}