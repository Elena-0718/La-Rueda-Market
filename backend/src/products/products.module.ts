import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';

import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Product, Category])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}