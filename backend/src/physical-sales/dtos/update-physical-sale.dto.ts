import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { PhysicalSalePaymentMethod } from '../../entities/physical-sale.entity';

export class UpdatePhysicalSaleDto {
  @ApiPropertyOptional({
    description: 'Fecha en la que se realizó la venta física.',
    example: '2026-08-04',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de venta debe ser válida.' })
  saleDate?: string;

  @ApiPropertyOptional({
    description: 'Método de pago usado en la venta física.',
    enum: PhysicalSalePaymentMethod,
    example: PhysicalSalePaymentMethod.TRANSFER,
  })
  @IsOptional()
  @IsEnum(PhysicalSalePaymentMethod, {
    message: 'El método de pago no es válido.',
  })
  paymentMethod?: PhysicalSalePaymentMethod;

  @ApiPropertyOptional({
    description: 'Notas internas sobre la venta física.',
    example: 'Venta corregida por ajuste interno.',
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto válido.' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Estado de la venta física.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser verdadero o falso.' })
  isActive?: boolean;
}