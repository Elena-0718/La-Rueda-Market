import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { CashDepositMethod } from '../../entities/cash-deposit.entity';

export class CreateCashDepositDto {
  @ApiProperty({
    description: 'Fecha de la consignación o traslado.',
    example: '2026-08-06',
  })
  @IsDateString({}, { message: 'La fecha de consignación debe ser válida.' })
  depositDate: string;

  @ApiProperty({
    description: 'Valor consignado o trasladado.',
    example: 300000,
  })
  @IsNumber({}, { message: 'El valor consignado debe ser numérico.' })
  @Min(1, { message: 'El valor consignado debe ser mayor a cero.' })
  amount: number;

  @ApiProperty({
    description: 'Medio usado para la consignación.',
    enum: CashDepositMethod,
    example: CashDepositMethod.CASH_CORRESPONDENT,
  })
  @IsEnum(CashDepositMethod, {
    message: 'El medio de consignación no es válido.',
  })
  depositMethod: CashDepositMethod;

  @ApiPropertyOptional({
    description: 'Cuenta, banco o billetera destino.',
    example: 'Bancolombia ahorros',
  })
  @IsOptional()
  @IsString({ message: 'La cuenta destino debe ser un texto válido.' })
  @MaxLength(150, {
    message: 'La cuenta destino no puede superar los 150 caracteres.',
  })
  destinationAccount?: string;

  @ApiPropertyOptional({
    description: 'Número de comprobante o referencia.',
    example: '458921',
  })
  @IsOptional()
  @IsString({ message: 'El número de comprobante debe ser un texto válido.' })
  @MaxLength(100, {
    message: 'El número de comprobante no puede superar los 100 caracteres.',
  })
  receiptNumber?: string;

  @ApiPropertyOptional({
    description: 'Responsable de realizar la consignación.',
    example: 'Administrador',
  })
  @IsOptional()
  @IsString({ message: 'El responsable debe ser un texto válido.' })
  @MaxLength(150, {
    message: 'El responsable no puede superar los 150 caracteres.',
  })
  responsibleName?: string;

  @ApiPropertyOptional({
    description: 'Notas, observaciones o enlace al soporte en Drive.',
    example: 'Soporte: https://drive.google.com/... Consignación por corresponsal.',
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto válido.' })
  notes?: string;
}