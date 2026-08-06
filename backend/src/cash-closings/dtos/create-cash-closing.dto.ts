import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCashClosingDto {
  @ApiProperty({
    description: 'Fecha del cierre de caja.',
    example: '2026-08-06',
  })
  @IsDateString({}, { message: 'La fecha del cierre debe ser válida.' })
  closingDate: string;

  @ApiPropertyOptional({
    description: 'Nombre del responsable del cierre de caja.',
    example: 'Administrador',
  })
  @IsOptional()
  @IsString({ message: 'El responsable debe ser un texto válido.' })
  @MaxLength(150, {
    message: 'El nombre del responsable no puede superar los 150 caracteres.',
  })
  responsibleName?: string;

  @ApiProperty({
    description: 'Saldo inicial en efectivo.',
    example: 50000,
  })
  @IsNumber({}, { message: 'El saldo inicial debe ser numérico.' })
  @Min(0, { message: 'El saldo inicial no puede ser negativo.' })
  initialCash: number;

  @ApiPropertyOptional({
    description: 'Ventas en efectivo del día.',
    example: 180000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Las ventas en efectivo deben ser numéricas.' })
  @Min(0, { message: 'Las ventas en efectivo no pueden ser negativas.' })
  cashSales?: number;

  @ApiPropertyOptional({
    description: 'Gastos pagados en efectivo durante el día.',
    example: 20000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Los gastos en efectivo deben ser numéricos.' })
  @Min(0, { message: 'Los gastos en efectivo no pueden ser negativos.' })
  cashExpenses?: number;

  @ApiPropertyOptional({
    description: 'Efectivo consignado o trasladado a banco.',
    example: 100000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Las consignaciones deben ser numéricas.' })
  @Min(0, { message: 'Las consignaciones no pueden ser negativas.' })
  cashDeposits?: number;

  @ApiPropertyOptional({
    description: 'Retiros de efectivo de caja.',
    example: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Los retiros deben ser numéricos.' })
  @Min(0, { message: 'Los retiros no pueden ser negativos.' })
  cashWithdrawals?: number;

  @ApiProperty({
    description: 'Saldo contado físicamente al cierre.',
    example: 108000,
  })
  @IsNumber({}, { message: 'El saldo contado debe ser numérico.' })
  @Min(0, { message: 'El saldo contado no puede ser negativo.' })
  countedCash: number;

  @ApiPropertyOptional({
    description: 'Notas u observaciones del cierre.',
    example: 'Faltante de $2.000 pendiente por revisar.',
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto válido.' })
  notes?: string;
}