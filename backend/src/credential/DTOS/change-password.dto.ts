import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { MatchPassword } from '../../decorators/matchPassword.decorator';



export class ChangePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual del usuario.',
    example: 'Password123*',
  })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria.' })
  @IsString({ message: 'La contraseña actual debe ser texto.' })
  currentPassword: string;

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