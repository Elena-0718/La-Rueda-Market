import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


import { CreateUserDto } from '../../users/dtos/CreateUser.dto';
import { CreateCredentialDto } from './create-credential.dto';

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