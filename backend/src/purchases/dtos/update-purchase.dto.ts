import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePurchaseDto {
  @ApiPropertyOptional({
    example: '2026-08-06',
    description: 'Fecha de la compra. Campo editable porque no afecta inventario.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: 'Proveedor local',
    description: 'Nombre del proveedor. Campo editable porque no afecta inventario.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  supplierName?: string;

  @ApiPropertyOptional({
    example: 'b8e1a9b2-1111-4444-9999-6a4a2f000000',
    description:
      'UUID del pedido relacionado, si la compra corresponde a un pedido programado. Campo editable de trazabilidad.',
  })
  @IsOptional()
  @IsUUID()
  relatedOrderUuid?: string;

  @ApiPropertyOptional({
    example: 'Soporte: https://drive.google.com/...',
    description: 'Notas, observaciones o enlace del soporte de la compra.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}