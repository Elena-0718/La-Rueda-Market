import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nombre de la categoría del catálogo.',
    example: 'Abarrotes',
  })
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio.' })
  @MaxLength(100, {
    message: 'El nombre no puede superar los 100 caracteres.',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional de la categoría.',
    example: 'Productos básicos para el consumo diario del hogar.',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Orden de visualización de la categoría en el catálogo.',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El orden debe ser un número entero.' })
  @Min(0, { message: 'El orden no puede ser negativo.' })
  sortOrder?: number;
}