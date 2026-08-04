import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseDetailDto {
  @ApiProperty({
    description: 'UUID del producto comprado.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @IsUUID('4', { message: 'El UUID del producto no es válido.' })
  @IsNotEmpty({ message: 'El producto es obligatorio.' })
  productUuid: string;

  @ApiProperty({
    description: 'Cantidad comprada.',
    example: 10,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad debe ser numérica.' })
  @IsPositive({ message: 'La cantidad debe ser mayor a cero.' })
  quantity: number;

  @ApiProperty({
    description: 'Precio de compra unitario.',
    example: 2500,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio de compra debe ser numérico.' })
  @IsPositive({ message: 'El precio de compra debe ser mayor a cero.' })
  unitCost: number;

  @ApiProperty({
    description: 'Porcentaje de ganancia aplicado sobre el precio de compra.',
    example: 30,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'El porcentaje de ganancia debe ser numérico.' })
  @Min(0, { message: 'El porcentaje de ganancia no puede ser negativo.' })
  profitPercentage: number;

  @ApiPropertyOptional({
    description:
      'Precio de venta manual definido por el administrador. Si se envía, este precio tiene prioridad sobre el precio sugerido.',
    example: 2900,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio manual debe ser numérico.' })
  @IsPositive({ message: 'El precio manual debe ser mayor a cero.' })
  manualSalePrice?: number;

  @ApiProperty({
    description:
      'Define si el precio final debe actualizar el precio del producto en catálogo.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'updateProductPrice debe ser verdadero o falso.' })
  updateProductPrice?: boolean;
}