import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { MatchPassword } from '../../decorators/matchPassword.decorator';

export class ResetPasswordDto {
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

  @ApiProperty({
    description: 'Nueva contraseña del usuario.',
    example: 'NewPassword123*',
  })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria.' })
  @IsString({ message: 'La nueva contraseña debe ser texto.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?_~\-])[A-Za-z\d!@#$%^&*?_~\-]{8,}$/,
    {
      message:
        'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.',
    },
  )
  newPassword: string;

  @ApiProperty({
    description: 'Confirmación de la nueva contraseña.',
    example: 'NewPassword123*',
  })
  @IsNotEmpty({
    message: 'La confirmación de la nueva contraseña es obligatoria.',
  })
  @IsString({ message: 'La confirmación debe ser texto.' })
  @MatchPassword('newPassword')
  confirmNewPassword: string;
}