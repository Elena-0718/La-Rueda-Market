import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateDeliveryDto {
  @ApiProperty({
    description: 'UUID del pedido al que se le creará el domicilio.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @IsUUID('4', {
    message: 'El UUID del pedido no es válido.',
  })
  orderUuid: string;

  @ApiPropertyOptional({
    description:
      'Persona encargada de entregar el pedido. Puede ser un domiciliario o responsable interno.',
    example: 'Don Carlos',
  })
  @IsOptional()
  @IsString({
    message: 'El encargado del domicilio debe ser texto.',
  })
  @MaxLength(120, {
    message: 'El encargado no puede superar los 120 caracteres.',
  })
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales para el domicilio.',
    example: 'Entregar después de las 3 p.m.',
  })
  @IsOptional()
  @IsString({
    message: 'Las notas de entrega deben ser texto.',
  })
  deliveryNotes?: string;
}