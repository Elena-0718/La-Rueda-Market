import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import {
  InventoryMovementReason,
  InventoryMovementType,
} from '../../entities/inventory-movement.entity';

export class CreateInventoryMovementDto {
  @ApiProperty({
    example: '0f2f3c9b-5d5a-4d19-a0e4-1e74c6c88b20',
    description: 'UUID del registro de inventario.',
  })
  @IsUUID()
  @IsNotEmpty()
  inventoryUuid: string;

  @ApiProperty({
    enum: InventoryMovementType,
    example: InventoryMovementType.IN,
    description: 'Tipo de movimiento: entrada o salida.',
  })
  @IsEnum(InventoryMovementType)
  @IsNotEmpty()
  movementType: InventoryMovementType;

  @ApiProperty({
    enum: InventoryMovementReason,
    example: InventoryMovementReason.SUPPLIER_PURCHASE,
    description: 'Motivo del movimiento de inventario.',
  })
  @IsEnum(InventoryMovementReason)
  @IsNotEmpty()
  reason: InventoryMovementReason;

  @ApiProperty({
    example: 10,
    description: 'Cantidad que entra o sale del inventario.',
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    example: 2400,
    description: 'Precio de compra unitario, si aplica.',
  })
  @IsOptional()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({
    example: 'Distribuidora El Campo',
    description: 'Proveedor relacionado al movimiento, si aplica.',
  })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiPropertyOptional({
    example: '2026-08-30',
    description: 'Fecha de vencimiento asociada al movimiento, si aplica.',
  })
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiPropertyOptional({
    example: 'b2b312d9-44f5-4c7c-b5ce-fb1f2c322c22',
    description: 'UUID del pedido online relacionado, si aplica.',
  })
  @IsOptional()
  @IsString()
  orderUuid?: string;

  @ApiPropertyOptional({
    example: 'Salida para cubrir pedidos programados de la semana.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}