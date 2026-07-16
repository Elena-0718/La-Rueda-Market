import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({
    example: '0f2f3c9b-5d5a-4d19-a0e4-1e74c6c88b20',
    description: 'UUID del producto asociado al inventario.',
  })
  @IsUUID()
  @IsNotEmpty()
  productUuid: string;

  @ApiPropertyOptional({
    example: 40,
    description: 'Stock físico actual del producto.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentStock?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Cantidad mínima para mostrar alerta de bajo stock.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumStock?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si el producto se controla en inventario.',
  })
  @IsOptional()
  @IsBoolean()
  isTracked?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si el producto puede vencer o dañarse.',
  })
  @IsOptional()
  @IsBoolean()
  isPerishable?: boolean;

  @ApiPropertyOptional({
    example: '2026-08-30',
    description: 'Fecha de vencimiento del producto, si aplica.',
  })
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiPropertyOptional({
    example: 7,
    description: 'Días antes del vencimiento para mostrar alerta.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  expirationAlertDays?: number;

  @ApiPropertyOptional({
    example: 'Distribuidora El Campo',
    description: 'Proveedor de referencia.',
  })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiPropertyOptional({
    example: 2400,
    description: 'Último precio de compra registrado.',
  })
  @IsOptional()
  @Min(0)
  lastPurchasePrice?: number;

  @ApiPropertyOptional({
    example: 'Producto controlado para venta física y pedidos online.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}