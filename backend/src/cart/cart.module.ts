import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Cart } from '../entities/cart.entity';
import { CartDetail } from '../entities/cartDetail.entity';

import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartDetail,
    ]),
  ],
  controllers: [CartController],
  providers: [
    CartService,
    CartRepository,
  ],
  exports: [
    CartService,
    CartRepository,
  ],
})
export class CartModule {}
