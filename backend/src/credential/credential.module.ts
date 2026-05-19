import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Credential } from '../entities/credential.entity';
import { User } from '../entities/users.entity';
import { CredentialController } from './credential.controller';
import { CredentialRepository } from './credential.repository';
import { CredentialService } from './credential.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Credential,
      User,
    ]),
  ],
  controllers: [CredentialController],
  providers: [
    CredentialService,
    CredentialRepository,
  ],
  exports: [
    CredentialRepository,
    CredentialService,
  ],
})
export class CredentialModule {}
