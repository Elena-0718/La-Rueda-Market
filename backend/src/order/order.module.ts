import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from '../entities/order.entity';
import { OrderDetail } from '../entities/orderDetail.entity';
import { Cart } from '../entities/cart.entity';
import { CartDetail } from '../entities/cartDetail.entity';
import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';

import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderDetail,
      Cart,
      CartDetail,
      Inventory,
      InventoryMovement,
    ]),
    CartModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
  ],
  exports: [
    OrderService,
    OrderRepository,
  ],
})
export class OrderModule {}