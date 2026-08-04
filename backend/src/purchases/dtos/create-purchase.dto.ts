import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { PurchaseType } from '../../entities/purchase.entity';
import { CreatePurchaseDetailDto } from './create-purchase-detail.dto';

export class CreatePurchaseDto {
  @ApiProperty({
    description: 'Fecha en la que se realizó la compra.',
    example: '2026-08-03',
  })
  @IsDateString({}, { message: 'La fecha de compra debe ser válida.' })
  purchaseDate: string;

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

  @ApiProperty({
    description: 'Tipo de compra.',
    enum: PurchaseType,
    example: PurchaseType.INVENTORY,
  })
  @IsEnum(PurchaseType, {
    message: 'El tipo de compra no es válido.',
  })
  purchaseType: PurchaseType;

  @ApiPropertyOptional({
    description: 'UUID del pedido programado relacionado, si aplica.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El UUID del pedido relacionado no es válido.' })
  relatedOrderUuid?: string;

  @ApiPropertyOptional({
    description: 'Notas internas sobre la compra.',
    example: 'Compra realizada para surtir productos de alta rotación.',
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto válido.' })
  notes?: string;

  @ApiProperty({
    description: 'Detalle de productos comprados.',
    type: [CreatePurchaseDetailDto],
  })
  @IsArray({ message: 'Los detalles de compra deben enviarse como lista.' })
  @ArrayMinSize(1, {
    message: 'Debes registrar al menos un producto comprado.',
  })
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseDetailDto)
  details: CreatePurchaseDetailDto[];
}