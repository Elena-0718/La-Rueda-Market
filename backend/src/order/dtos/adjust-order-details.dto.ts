import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AdjustOrderDetailDto } from './adjust-order-detail.dto';

export class AdjustOrderDetailsDto {
  @ApiProperty({
    description: 'Lista de ajustes para los productos del pedido.',
    type: [AdjustOrderDetailDto],
  })
  @IsArray({ message: 'Los detalles deben enviarse como una lista.' })
  @ArrayMinSize(1, {
    message: 'Debes enviar al menos un detalle para ajustar.',
  })
  @ValidateNested({ each: true })
  @Type(() => AdjustOrderDetailDto)
  details: AdjustOrderDetailDto[];

  @ApiPropertyOptional({
    description: 'Nota administrativa del ajuste realizado.',
    example: 'No se consiguió pechuga. Se ajusta el valor final del pedido.',
  })
  @IsOptional()
  @IsString({ message: 'La nota debe ser un texto válido.' })
  notes?: string;
}