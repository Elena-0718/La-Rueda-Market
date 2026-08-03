import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ExpenseCategory,
  ExpensePaymentMethod,
} from '../../entities/expense.entity';

export class UpdateExpenseDto {
  @ApiPropertyOptional({
    description: 'Fecha en la que se realizó el gasto operativo.',
    example: '2026-08-03',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha del gasto debe ser válida.' })
  expenseDate?: string;

  @ApiPropertyOptional({
    description: 'Categoría del gasto operativo.',
    enum: ExpenseCategory,
    example: ExpenseCategory.PACKAGING,
  })
  @IsOptional()
  @IsEnum(ExpenseCategory, {
    message: 'La categoría del gasto no es válida.',
  })
  category?: ExpenseCategory;

  @ApiPropertyOptional({
    description: 'Descripción breve del gasto.',
    example: 'Compra de bolsas para empacar mercados',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @MaxLength(150, {
    message: 'La descripción no puede superar los 150 caracteres.',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Valor del gasto operativo.',
    example: 18000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El valor del gasto debe ser numérico.' })
  @IsPositive({ message: 'El valor del gasto debe ser mayor a cero.' })
  amount?: number;

  @ApiPropertyOptional({
    description: 'Método de pago usado para cubrir el gasto.',
    enum: ExpensePaymentMethod,
    example: ExpensePaymentMethod.TRANSFER,
  })
  @IsOptional()
  @IsEnum(ExpensePaymentMethod, {
    message: 'El método de pago no es válido.',
  })
  paymentMethod?: ExpensePaymentMethod;

  @ApiPropertyOptional({
    description: 'Notas internas u observaciones del gasto.',
    example: 'Compra realizada para operación semanal.',
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto válido.' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Estado del gasto. Permite activarlo o desactivarlo.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser verdadero o falso.' })
  isActive?: boolean;
}