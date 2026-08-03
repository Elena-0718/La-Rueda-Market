import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ExpenseCategory,
  ExpensePaymentMethod,
} from '../../entities/expense.entity';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Fecha en la que se realizó el gasto operativo.',
    example: '2026-08-03',
  })
  @IsDateString({}, { message: 'La fecha del gasto debe ser válida.' })
  expenseDate: string;

  @ApiProperty({
    description: 'Categoría del gasto operativo.',
    enum: ExpenseCategory,
    example: ExpenseCategory.FUEL,
  })
  @IsEnum(ExpenseCategory, {
    message: 'La categoría del gasto no es válida.',
  })
  category: ExpenseCategory;

  @ApiProperty({
    description: 'Descripción breve del gasto.',
    example: 'Gasolina para ruta de domicilios',
  })
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @IsNotEmpty({ message: 'La descripción del gasto es obligatoria.' })
  @MaxLength(150, {
    message: 'La descripción no puede superar los 150 caracteres.',
  })
  description: string;

  @ApiProperty({
    description: 'Valor del gasto operativo.',
    example: 25000,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'El valor del gasto debe ser numérico.' })
  @IsPositive({ message: 'El valor del gasto debe ser mayor a cero.' })
  amount: number;

  @ApiProperty({
    description: 'Método de pago usado para cubrir el gasto.',
    enum: ExpensePaymentMethod,
    example: ExpensePaymentMethod.CASH,
  })
  @IsEnum(ExpensePaymentMethod, {
    message: 'El método de pago no es válido.',
  })
  paymentMethod: ExpensePaymentMethod;

  @ApiPropertyOptional({
    description: 'Notas internas u observaciones del gasto.',
    example: 'Gasto asociado a entregas programadas del día.',
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto válido.' })
  notes?: string;
}