import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Delivery } from '../entities/delivery.entity';
import { Order } from '../entities/order.entity';

import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryRepository } from './delivery.repository';

import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Delivery,
      Order,
    ]),
    OrderModule,
  ],
  controllers: [DeliveryController],
  providers: [
    DeliveryService,
    DeliveryRepository,
  ],
  exports: [
    DeliveryService,
    DeliveryRepository,
  ],
})
export class DeliveryModule {}