import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { PurchaseType } from '../../entities/purchase.entity';

export class UpdatePurchaseDto {
  @ApiPropertyOptional({
    description: 'Fecha en la que se realizó la compra.',
    example: '2026-08-03',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de compra debe ser válida.' })
  purchaseDate?: string;

  @ApiPropertyOptional({
    description: 'Nombre del proveedor o lugar de compra.',
    example: 'Proveedor campesino local',
  })
  @IsOptional()
  @IsString({ message: 'El proveedor debe ser un texto válido.' })
  @MaxLength(150, {
    message: 'El proveedor no puede superar los 150 caracteres.',
  })
  supplierName?: string;

  @ApiPropertyOptional({
    description: 'Tipo de compra.',
    enum: PurchaseType,
    example: PurchaseType.INVENTORY,
  })
  @IsOptional()
  @IsEnum(PurchaseType, {
    message: 'El tipo de compra no es válido.',
  })
  purchaseType?: PurchaseType;

  @ApiPropertyOptional({
    description: 'Notas internas sobre la compra.',
    example: 'Compra corregida por ajuste de proveedor.',
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto válido.' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Estado de la compra.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser verdadero o falso.' })
  isActive?: boolean;
}