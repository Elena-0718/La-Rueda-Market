import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FavoriteProduct } from '../entities/favorite-product.entity';
import { User } from '../entities/users.entity';
import { Product } from '../entities/product.entity';

import { FavoriteProductsController } from './favorite-products.controller';
import { FavoriteProductsService } from './favorite-products.service';
import { FavoriteProductsRepository } from './favorite-products.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FavoriteProduct,
      User,
      Product,
    ]),
  ],
  controllers: [FavoriteProductsController],
  providers: [FavoriteProductsService, FavoriteProductsRepository],
  exports: [FavoriteProductsService, FavoriteProductsRepository, TypeOrmModule],
})
export class FavoriteProductsModule {}