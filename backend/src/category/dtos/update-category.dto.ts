import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Nombre de la categoría del catálogo.',
    example: 'Frutas y verduras',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @MaxLength(100, {
    message: 'El nombre no puede superar los 100 caracteres.',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional de la categoría.',
    example: 'Productos frescos disponibles bajo pedido programado.',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Orden de visualización de la categoría en el catálogo.',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El orden debe ser un número entero.' })
  @Min(0, { message: 'El orden no puede ser negativo.' })
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Estado de la categoría. Permite activarla o desactivarla.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser verdadero o falso.' })
  isActive?: boolean;
}