import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../entities/product.entity';
import { Recipe } from '../entities/recipe.entity';
import { RecipesController } from './recipes.controller';
import { RecipesRepository } from './recipes.repository';
import { RecipesService } from './recipes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, Product])],
  controllers: [RecipesController],
  providers: [RecipesService, RecipesRepository],
  exports: [RecipesService, RecipesRepository],
})
export class RecipesModule {}