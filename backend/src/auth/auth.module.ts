import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CredentialModule } from '../credential/credential.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    CredentialModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}