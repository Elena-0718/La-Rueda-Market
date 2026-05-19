import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { Roles } from '../../enum/roles.enum';

export class ChangeRoleDto {
  @ApiProperty({
    description: 'Nuevo rol del usuario.',
    example: Roles.CLIENT,
    enum: Roles,
  })
  @IsNotEmpty({ message: 'El rol es obligatorio.' })
  @IsEnum(Roles, {
    message: 'El rol debe ser ADMIN o CLIENT.',
  })
  role: Roles;
}