import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyResetCodeDto {
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
    description: 'Código recibido por SMS o WhatsApp.',
    example: '482913',
  })
  @IsNotEmpty({ message: 'El código es obligatorio.' })
  @IsString({ message: 'El código debe ser texto.' })
  @Matches(/^\d{6}$/, {
    message: 'El código debe tener 6 dígitos.',
  })
  code: string;
}