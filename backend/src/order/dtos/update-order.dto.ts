import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../entities/order.entity';


export class UpdateOrderDto {
  @ApiProperty({
    description: 'Nuevo estado del pedido.',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsEnum(OrderStatus, {
    message: 'Estado de pedido no válido.',
  })
  status: OrderStatus;
}