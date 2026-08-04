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

import { PhysicalSalePaymentMethod } from '../../entities/physical-sale.entity';
import { CreatePhysicalSaleDetailDto } from './create-physical-sale-detail.dto';

export class CreatePhysicalSaleDto {
  @ApiProperty({
    description: 'Fecha en la que se realizó la venta física.',
    example: '2026-08-04',
  })
  @IsDateString({}, { message: 'La fecha de venta debe ser válida.' })
  saleDate: string;

  @ApiPropertyOptional({
    description:
      'UUID opcional del usuario registrado asociado a la venta física.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El UUID del cliente registrado no es válido.' })
  customerUserUuid?: string;

  @ApiPropertyOptional({
    description:
      'Nombre del cliente local cuando no se asocia un usuario registrado.',
    example: 'Cliente local',
  })
  @IsOptional()
  @IsString({ message: 'El nombre del cliente debe ser un texto válido.' })
  @MaxLength(150, {
    message: 'El nombre del cliente no puede superar los 150 caracteres.',
  })
  customerName?: string;

  @ApiProperty({
    description: 'Método de pago usado en la venta física.',
    enum: PhysicalSalePaymentMethod,
    example: PhysicalSalePaymentMethod.CASH,
  })
  @IsEnum(PhysicalSalePaymentMethod, {
    message: 'El método de pago no es válido.',
  })
  paymentMethod: PhysicalSalePaymentMethod;

  @ApiPropertyOptional({
    description: 'Notas internas sobre la venta física.',
    example: 'Venta realizada en el local.',
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto válido.' })
  notes?: string;

  @ApiProperty({
    description: 'Detalle de productos vendidos.',
    type: [CreatePhysicalSaleDetailDto],
  })
  @IsArray({ message: 'Los detalles de venta deben enviarse como lista.' })
  @ArrayMinSize(1, {
    message: 'Debes registrar al menos un producto vendido.',
  })
  @ValidateNested({ each: true })
  @Type(() => CreatePhysicalSaleDetailDto)
  details: CreatePhysicalSaleDetailDto[];
}