import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PaymentMethod } from '../../entities/payment.entity';



export class CreatePaymentDto {
  @ApiProperty({
    enum: PaymentMethod,
    description: 'Método de pago seleccionado por el cliente.',
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod, {
    message: 'El método de pago no es válido.',
  })
  @IsNotEmpty({
    message: 'El método de pago es obligatorio.',
  })
  method: PaymentMethod;

  @ApiProperty({
    description: 'UUID del pedido asociado al pago.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @IsUUID('4', {
    message: 'El UUID del pedido no es válido.',
  })
  @IsNotEmpty({
    message: 'El pedido es obligatorio.',
  })
  orderUuid: string;

  @ApiPropertyOptional({
    description:
      'Referencia del pago. Puede ser número de transferencia, comprobante o nota del cliente.',
    example: 'NEQUI-123456',
  })
  @IsOptional()
  @IsString({
    message: 'La referencia debe ser texto.',
  })
  @MaxLength(100, {
    message: 'La referencia no puede superar los 100 caracteres.',
  })
  reference?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales del cliente sobre el pago.',
    example: 'Pago contraentrega en efectivo.',
  })
  @IsOptional()
  @IsString({
    message: 'Las notas del pago deben ser texto.',
  })
  paymentNotes?: string;
}