import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Min } from 'class-validator';

export class UpdateInventoryMovementDto {
  @ApiPropertyOptional({
    example: 2400,
    description: 'Precio de compra unitario, si aplica.',
  })
  @IsOptional()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({
    example: 'Distribuidora El Campo',
    description: 'Proveedor relacionado al movimiento.',
  })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiPropertyOptional({
    example: '2026-08-30',
    description: 'Fecha de vencimiento asociada, si aplica.',
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
    example: 'Nota administrativa actualizada.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}