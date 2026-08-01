import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Número de celular para recuperar la cuenta.',
    example: '3146780918',
  })
  @IsNotEmpty({
    message: 'El número de celular es obligatorio para recuperar la cuenta.',
  })
  @IsString({ message: 'El número de celular debe ser texto.' })
  @Matches(/^(?:\+57)?3\d{9}$/, {
    message: 'Debe ser un número de celular colombiano válido.',
  })
  phone: string;
}