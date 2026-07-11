import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'Dirección, vereda o referencia de entrega confirmada por el cliente.',
    example: 'Vereda El Espinal, casa blanca al lado de la escuela',
  })
  @IsOptional()
  @IsString({ message: 'La dirección de entrega debe ser texto.' })
  @MaxLength(255, {
    message: 'La dirección de entrega no puede superar los 255 caracteres.',
  })
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto para la entrega.',
    example: '3186844954',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono de entrega debe ser texto.' })
  @MaxLength(50, {
    message: 'El teléfono de entrega no puede superar los 50 caracteres.',
  })
  shippingPhone?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales para la entrega.',
    example: 'Llamar antes de llegar. El camino está destapado.',
  })
  @IsOptional()
  @IsString({ message: 'Las notas de entrega deben ser texto.' })
  deliveryNotes?: string;

  @ApiPropertyOptional({
    description:
      'Costo del domicilio. Para este PMV puede enviarse desde el frontend o manejarse en cero.',
    example: 4000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El costo del domicilio debe ser numérico.' })
  @IsPositive({ message: 'El costo del domicilio debe ser mayor a cero.' })
  deliveryCost?: number;
}