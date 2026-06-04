import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  Min,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

import { UnitMeasure } from '../../enum/unit-measure.enum';
import { AvailabilityType } from '../../enum/availability-type.enum';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre del producto.',
    example: 'Arroz Diana 500g',
  })
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio.' })
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del producto.',
    example: 'Arroz blanco de uso diario para el hogar.',
  })
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @IsNotEmpty({ message: 'La descripción del producto es obligatoria.' })
  description: string;

  @ApiProperty({
    description: 'Precio del producto en pesos colombianos.',
    example: 3200,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio debe ser un número válido.' })
  @Min(0, { message: 'El precio no puede ser negativo.' })
  price: number;

  @ApiProperty({
    description: 'Cantidad disponible en inventario.',
    example: 50,
  })
  @Type(() => Number)
  @IsInt({ message: 'El stock debe ser un número entero.' })
  @Min(0, { message: 'El stock no puede ser negativo.' })
  stock: number;

  @ApiProperty({
    description: 'Unidad de medida del producto.',
    enum: UnitMeasure,
    example: UnitMeasure.UNIT,
  })
  @IsEnum(UnitMeasure, { message: 'La unidad de medida no es válida.' })
  unitMeasure: UnitMeasure;

  @ApiProperty({
    description: 'Tipo de disponibilidad del producto.',
    enum: AvailabilityType,
    example: AvailabilityType.DAILY,
  })
  @IsEnum(AvailabilityType, {
    message: 'El tipo de disponibilidad no es válido.',
  })
  availabilityType: AvailabilityType;

  @ApiProperty({
    description: 'UUID de la categoría a la que pertenece el producto.',
    example: '193c0453-f65e-4b8c-9c9b-485281ba1011',
  })
  @IsUUID('4', { message: 'La categoría debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'La categoría es obligatoria.' })
  categoryUuid: string;

  @ApiPropertyOptional({
    description: 'Indica si el producto debe destacarse en el frontend.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isFeatured debe ser verdadero o falso.' })
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description:
      'Listado de rutas locales o URLs de imágenes del producto. Ejemplo: /uploads/products/arroz-diana-500g.jpg',
    example: [
      '/uploads/products/arroz-diana-500g.jpg',
      '/uploads/products/arroz-diana-500g-2.jpg',
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Las imágenes deben enviarse como un arreglo.' })
  @IsString({
    each: true,
    message: 'Cada imagen debe ser una ruta o URL válida en formato texto.',
  })
  images?: string[];
}