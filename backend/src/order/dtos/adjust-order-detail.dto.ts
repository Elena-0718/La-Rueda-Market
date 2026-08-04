import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustOrderDetailDto {
  @ApiProperty({
    description: 'UUID del detalle del pedido.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @IsUUID('4', { message: 'El UUID del detalle del pedido no es válido.' })
  orderDetailUuid: string;

  @ApiPropertyOptional({
    description:
      'Define si el producto se conserva en el pedido. Si es false, se elimina del pedido.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'keep debe ser verdadero o falso.' })
  keep?: boolean;

  @ApiPropertyOptional({
    description: 'Nueva cantidad del producto.',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @Min(0, { message: 'La cantidad no puede ser negativa.' })
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Nuevo precio unitario aplicado al producto.',
    example: 2900,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio unitario debe ser numérico.' })
  @IsPositive({ message: 'El precio unitario debe ser mayor a cero.' })
  unitPrice?: number;
}