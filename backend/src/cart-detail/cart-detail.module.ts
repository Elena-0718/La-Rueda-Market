import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartDetail } from '../entities/cartDetail.entity';
import { Cart } from '../entities/cart.entity';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';



import { CartModule } from '../cart/cart.module';
import { ProductsRepository } from '../products/products.repository';
import { CartDetailController } from './cart-detail.controller';
import { CartDetailService } from './cart-detail.service';
import { CartDetailRepository } from './cart-detail.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartDetail,
      Cart,
      Product,
      Category,
    ]),
    CartModule,
  ],
  controllers: [CartDetailController],
  providers: [
    CartDetailService,
    CartDetailRepository,
    ProductsRepository,
  ],
  exports: [
    CartDetailService,
    CartDetailRepository,
  ],
})
export class CartDetailModule {}