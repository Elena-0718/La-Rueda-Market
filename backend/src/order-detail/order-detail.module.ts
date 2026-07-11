import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from '../entities/order.entity';
import { OrderDetail } from '../entities/orderDetail.entity';

import { OrderModule } from '../order/order.module';

import { OrderDetailController } from './order-detail.controller';
import { OrderDetailService } from './order-detail.service';
import { OrderDetailRepository } from './order-detail.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderDetail,
      Order,
    ]),
    OrderModule,
  ],
  controllers: [OrderDetailController],
  providers: [
    OrderDetailService,
    OrderDetailRepository,
  ],
  exports: [
    OrderDetailRepository,
  ],
})
export class OrderDetailModule {}