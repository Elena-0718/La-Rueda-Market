import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { CreateCredentialDto } from './create-credential.dto';
import { CreateUserDto } from '../../users/DTOS/CreateUser.dto';

export class SignUpDto {
  @ApiProperty({
    type: CreateCredentialDto,
    description: 'Datos de acceso del cliente.',
  })
  @ValidateNested()
  @Type(() => CreateCredentialDto)
  createCredentialDto: CreateCredentialDto;

  @ApiProperty({
    type: CreateUserDto,
    description: 'Datos básicos del cliente.',
  })
  @ValidateNested()
  @Type(() => CreateUserDto)
  createUserDto: CreateUserDto;
}