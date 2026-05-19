import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Ana Milena Reyes Castro' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[\p{L}\s]+$/u, {
    message: 'El nombre solo debe contener letras y espacios.',
  })
  @MaxLength(150)
  fullName: string;

  @ApiProperty({ example: '3146780918' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?:\+57)?3\d{9}$/, {
    message: 'Debe ser un número colombiano válido.',
  })
  phone: string;

  @ApiProperty({ example: 'El Espinal' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  village: string;

  @ApiPropertyOptional({ example: '1998-05-20' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    example: 'https://miapp.com/uploads/users/foto.jpg',
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;
}