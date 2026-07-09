import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartDetail } from 'src/entities/cartDetail.entity';
import { Cart } from 'src/entities/cart.entity';
import { Product } from 'src/entities/product.entity';
import { Category } from 'src/entities/category.entity';



import { CartModule } from 'src/cart/cart.module';
import { ProductsRepository } from 'src/products/products.repository';
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