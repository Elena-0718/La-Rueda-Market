import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';



import { Category } from '../entities/category.entity';
import { CategoriesController } from './category.controller';
import { CategoriesService } from './category.service';
import { CategoriesRepository } from './category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository],
  exports: [CategoriesService, CategoriesRepository, TypeOrmModule],
})
export class CategoriesModule {}