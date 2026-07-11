import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { DeliveryStatus } from '../../entities/delivery.entity';

export class UpdateDeliveryStatusDto {
  @ApiProperty({
    enum: DeliveryStatus,
    description: 'Nuevo estado del domicilio.',
    example: DeliveryStatus.ON_THE_WAY,
  })
  @IsEnum(DeliveryStatus, {
    message: 'Estado de domicilio no válido.',
  })
  @IsNotEmpty({
    message: 'El estado del domicilio es obligatorio.',
  })
  status: DeliveryStatus;
}