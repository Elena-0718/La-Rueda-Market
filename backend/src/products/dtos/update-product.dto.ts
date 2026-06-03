import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  Min,
  IsInt,
  IsArray,
  IsUrl,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

import { UnitMeasure } from '../../enum/unit-measure.enum';
import { AvailabilityType } from '../../enum/availability-type.enum';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Nombre del producto.',
    example: 'Arroz Diana 500g',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Descripción del producto.',
    example: 'Arroz blanco para consumo diario.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Precio del producto.',
    example: 3500,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un número válido.' })
  @Min(0, { message: 'El precio no puede ser negativo.' })
  price?: number;

  @ApiPropertyOptional({
    description: 'Stock disponible.',
    example: 30,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero.' })
  @Min(0, { message: 'El stock no puede ser negativo.' })
  stock?: number;

  @ApiPropertyOptional({
    description: 'Unidad de medida del producto.',
    enum: UnitMeasure,
    example: UnitMeasure.UNIT,
  })
  @IsOptional()
  @IsEnum(UnitMeasure, { message: 'La unidad de medida no es válida.' })
  unitMeasure?: UnitMeasure;

  @ApiPropertyOptional({
    description: 'Tipo de disponibilidad del producto.',
    enum: AvailabilityType,
    example: AvailabilityType.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(AvailabilityType, {
    message: 'El tipo de disponibilidad no es válido.',
  })
  availabilityType?: AvailabilityType;

  @ApiPropertyOptional({
    description: 'UUID de la nueva categoría.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c4',
  })
  @IsOptional()
  @IsUUID('4', { message: 'La categoría debe ser un UUID válido.' })
  categoryUuid?: string;

  @ApiPropertyOptional({
    description: 'Indica si el producto debe destacarse en el frontend.',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isFeatured debe ser verdadero o falso.' })
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Listado de URLs de imágenes del producto.',
    example: ['https://miapp.com/images/arroz-diana.jpg'],
  })
  @IsOptional()
  @IsArray({ message: 'Las imágenes deben enviarse como un arreglo.' })
  @IsUrl({}, { each: true, message: 'Cada imagen debe ser una URL válida.' })
  images?: string[];
}