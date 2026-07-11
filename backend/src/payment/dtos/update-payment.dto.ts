import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaymentStatus } from '../../entities/payment.entity';

export class UpdatePaymentDto {
  @ApiPropertyOptional({
    enum: PaymentStatus,
    description: 'Nuevo estado del pago.',
    example: PaymentStatus.CONFIRMED,
  })
  @IsOptional()
  @IsEnum(PaymentStatus, {
    message: 'El estado del pago no es válido.',
  })
  status?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Notas administrativas sobre el pago.',
    example: 'Transferencia validada manualmente.',
  })
  @IsOptional()
  @IsString({
    message: 'Las notas del pago deben ser texto.',
  })
  paymentNotes?: string;
}