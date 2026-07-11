import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Payment } from '../entities/payment.entity';
import { Order } from '../entities/order.entity';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';

import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Order,
    ]),
    OrderModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentRepository,
  ],
  exports: [
    PaymentService,
    PaymentRepository,
  ],
})
export class PaymentModule {}