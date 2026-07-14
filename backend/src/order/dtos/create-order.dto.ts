import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { FulfillmentType } from '../../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({
    description:
      'Forma en la que el cliente recibirá el pedido. PICKUP es recoger en tienda. SCHEDULED_DELIVERY es domicilio programado.',
    enum: FulfillmentType,
    example: FulfillmentType.SCHEDULED_DELIVERY,
  })
  @IsEnum(FulfillmentType, {
    message: 'La forma de entrega no es válida.',
  })
  @IsNotEmpty({
    message: 'La forma de entrega es obligatoria.',
  })
  fulfillmentType: FulfillmentType;

  @ApiPropertyOptional({
    description:
      'Dirección, vereda o referencia de entrega confirmada por el cliente. Solo es obligatoria para domicilio programado.',
    example: 'Vereda El Espinal, casa blanca al lado de la escuela',
  })
  @IsOptional()
  @IsString({ message: 'La dirección de entrega debe ser texto.' })
  @MaxLength(255, {
    message: 'La dirección de entrega no puede superar los 255 caracteres.',
  })
  shippingAddress?: string;

  @ApiPropertyOptional({
    description:
      'Teléfono de contacto para la entrega o recogida del pedido.',
    example: '3186844954',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono de contacto debe ser texto.' })
  @MaxLength(50, {
    message: 'El teléfono de contacto no puede superar los 50 caracteres.',
  })
  shippingPhone?: string;

  @ApiPropertyOptional({
    description:
      'Notas adicionales para la entrega o recogida del pedido.',
    example: 'Llamar antes de llegar. El camino está destapado.',
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser texto.' })
  deliveryNotes?: string;
}