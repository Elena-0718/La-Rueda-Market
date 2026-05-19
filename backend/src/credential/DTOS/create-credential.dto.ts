import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

import { MatchPassword } from '../../decorators/matchPassword.decorator';

export class CreateCredentialDto {
  @ApiProperty({
    description: 'Número de celular del usuario.',
    example: '3146780918',
  })
  @IsNotEmpty({ message: 'El número de celular es obligatorio.' })
  @IsString({ message: 'El número de celular debe ser texto.' })
  @Matches(/^(?:\+57)?3\d{9}$/, {
    message: 'Debe ser un número de celular colombiano válido.',
  })
  phone: string;

  @ApiProperty({
    description: 'Contraseña segura del usuario.',
    example: 'Password123*',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @IsString({ message: 'La contraseña debe ser texto.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?_~\-])[A-Za-z\d!@#$%^&*?_~\-]{8,}$/,
    {
      message:
        'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Confirmación de contraseña.',
    example: 'Password123*',
  })
  @IsNotEmpty({ message: 'La confirmación de contraseña es obligatoria.' })
  @IsString({ message: 'La confirmación debe ser texto.' })
  @MatchPassword('password')
  confirmPassword: string;
}