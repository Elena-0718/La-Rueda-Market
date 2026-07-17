import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Product } from '../entities/product.entity';
import { Recipe } from '../entities/recipe.entity';

@Injectable()
export class RecipesRepository {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  createRecipe(recipeData: Partial<Recipe>) {
    return this.recipeRepository.create(recipeData);
  }

  saveRecipe(recipe: Recipe) {
    return this.recipeRepository.save(recipe);
  }

  removeRecipe(recipe: Recipe) {
    return this.recipeRepository.remove(recipe);
  }

  findAllRecipesAdmin() {
    return this.recipeRepository.find({
      relations: {
        mainProducts: {
          category: true,
        },
        products: {
          category: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findActiveRecipes() {
    return this.recipeRepository.find({
      where: {
        isActive: true,
      },
      relations: {
        mainProducts: {
          category: true,
        },
        products: {
          category: true,
        },
      },
      order: {
        isFeatured: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  findRecipeByUuid(uuid: string) {
    return this.recipeRepository.findOne({
      where: { uuid },
      relations: {
        mainProducts: {
          category: true,
        },
        products: {
          category: true,
        },
      },
    });
  }

  findActiveRecipeByUuid(uuid: string) {
    return this.recipeRepository.findOne({
      where: {
        uuid,
        isActive: true,
      },
      relations: {
        mainProducts: {
          category: true,
        },
        products: {
          category: true,
        },
      },
    });
  }

  findProductsByUuids(productUuids: string[]) {
    return this.productRepository.find({
      where: {
        uuid: In(productUuids),
      },
      relations: {
        category: true,
      },
    });
  }

  findActiveRecipesByMainProductUuid(productUuid: string) {
    return this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.mainProducts', 'mainProduct')
      .leftJoinAndSelect('mainProduct.category', 'mainProductCategory')
      .leftJoinAndSelect('recipe.products', 'product')
      .leftJoinAndSelect('product.category', 'productCategory')
      .where('recipe.isActive = :isActive', { isActive: true })
      .andWhere('mainProduct.uuid = :productUuid', { productUuid })
      .orderBy('recipe.isFeatured', 'DESC')
      .addOrderBy('recipe.createdAt', 'DESC')
      .getMany();
  }

  async findMainProductUuidsWithActiveRecipes() {
    const rows = await this.recipeRepository
      .createQueryBuilder('recipe')
      .innerJoin('recipe.mainProducts', 'mainProduct')
      .select('mainProduct.uuid', 'uuid')
      .where('recipe.isActive = :isActive', { isActive: true })
      .getRawMany();

    return rows.map((row) => row.uuid);
  }
}