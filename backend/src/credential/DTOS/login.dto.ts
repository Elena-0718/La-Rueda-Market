import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
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
    description: 'Contraseña del usuario.',
    example: 'Password123*',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @IsString({ message: 'La contraseña debe ser texto.' })
  password: string;
}