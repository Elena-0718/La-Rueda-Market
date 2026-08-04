import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePhysicalSaleDetailDto {
  @ApiProperty({
    description: 'UUID del producto vendido en el local.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @IsUUID('4', { message: 'El UUID del producto no es válido.' })
  @IsNotEmpty({ message: 'El producto es obligatorio.' })
  productUuid: string;

  @ApiProperty({
    description: 'Cantidad vendida.',
    example: 2,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad debe ser numérica.' })
  @IsPositive({ message: 'La cantidad debe ser mayor a cero.' })
  quantity: number;

  @ApiPropertyOptional({
    description:
      'Precio unitario aplicado en la venta física. Si no se envía, se usa el precio actual del producto.',
    example: 3200,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio unitario debe ser numérico.' })
  @IsPositive({ message: 'El precio unitario debe ser mayor a cero.' })
  unitPrice?: number;
}