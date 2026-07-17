import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateRecipeDto } from './dtos/create-recipe.dto';
import { UpdateRecipeDto } from './dtos/update-recipe.dto';
import { RecipesRepository } from './recipes.repository';
import {
  RecipeCategory,
  RecipeDifficulty,
} from '../entities/recipe.entity';

@Injectable()
export class RecipesService {
  constructor(private readonly recipesRepository: RecipesRepository) {}

  async createRecipeService(createRecipeDto: CreateRecipeDto) {
    const mainProducts = await this.getProductsFromDto(
      createRecipeDto.mainProductUuids,
      'UNO O VARIOS PRODUCTOS PRINCIPALES NO EXISTEN.',
    );

    const products = await this.getProductsFromDto(
      createRecipeDto.productUuids,
      'UNO O VARIOS PRODUCTOS RECOMENDADOS NO EXISTEN.',
    );

    const recipe = this.recipesRepository.createRecipe({
      title: createRecipeDto.title.trim(),
      description: createRecipeDto.description.trim(),
      videoUrl: createRecipeDto.videoUrl?.trim() || null,
      image: createRecipeDto.image?.trim() || null,
      category: createRecipeDto.category ?? RecipeCategory.OTHER,
      difficulty: createRecipeDto.difficulty ?? RecipeDifficulty.EASY,
      preparationTime: createRecipeDto.preparationTime ?? null,
      servings: createRecipeDto.servings ?? null,
      ingredientNotes: createRecipeDto.ingredientNotes?.trim() || null,
      steps: this.cleanTextArray(createRecipeDto.steps),
      extraIngredients: this.cleanTextArray(createRecipeDto.extraIngredients),
      tips: createRecipeDto.tips?.trim() || null,
      isActive: createRecipeDto.isActive ?? true,
      isFeatured: createRecipeDto.isFeatured ?? false,
      mainProducts,
      products,
    });

    return this.recipesRepository.saveRecipe(recipe);
  }

  async getAllRecipesAdminService() {
    return this.recipesRepository.findAllRecipesAdmin();
  }

  async getActiveRecipesService(productUuid?: string) {
    if (productUuid) {
      return this.recipesRepository.findActiveRecipesByMainProductUuid(
        productUuid,
      );
    }

    return this.recipesRepository.findActiveRecipes();
  }

  async getRecipeByUuidAdminService(uuid: string) {
    const recipe = await this.recipesRepository.findRecipeByUuid(uuid);

    if (!recipe) {
      throw new NotFoundException('LA RECETA NO EXISTE.');
    }

    return recipe;
  }

  async getActiveRecipeByUuidService(uuid: string) {
    const recipe = await this.recipesRepository.findActiveRecipeByUuid(uuid);

    if (!recipe) {
      throw new NotFoundException('LA RECETA NO EXISTE O NO ESTÁ ACTIVA.');
    }

    return recipe;
  }

  async updateRecipeService(uuid: string, updateRecipeDto: UpdateRecipeDto) {
    const recipe = await this.recipesRepository.findRecipeByUuid(uuid);

    if (!recipe) {
      throw new NotFoundException('LA RECETA NO EXISTE.');
    }

    if (updateRecipeDto.title !== undefined) {
      recipe.title = updateRecipeDto.title.trim();
    }

    if (updateRecipeDto.description !== undefined) {
      recipe.description = updateRecipeDto.description.trim();
    }

    if (updateRecipeDto.videoUrl !== undefined) {
      recipe.videoUrl = updateRecipeDto.videoUrl?.trim() || null;
    }

    if (updateRecipeDto.image !== undefined) {
      recipe.image = updateRecipeDto.image?.trim() || null;
    }

    if (updateRecipeDto.category !== undefined) {
      recipe.category = updateRecipeDto.category;
    }

    if (updateRecipeDto.difficulty !== undefined) {
      recipe.difficulty = updateRecipeDto.difficulty;
    }

    if (updateRecipeDto.preparationTime !== undefined) {
      recipe.preparationTime = updateRecipeDto.preparationTime ?? null;
    }

    if (updateRecipeDto.servings !== undefined) {
      recipe.servings = updateRecipeDto.servings ?? null;
    }

    if (updateRecipeDto.ingredientNotes !== undefined) {
      recipe.ingredientNotes =
        updateRecipeDto.ingredientNotes?.trim() || null;
    }

    if (updateRecipeDto.steps !== undefined) {
      recipe.steps = this.cleanTextArray(updateRecipeDto.steps);
    }

    if (updateRecipeDto.extraIngredients !== undefined) {
      recipe.extraIngredients = this.cleanTextArray(
        updateRecipeDto.extraIngredients,
      );
    }

    if (updateRecipeDto.tips !== undefined) {
      recipe.tips = updateRecipeDto.tips?.trim() || null;
    }

    if (updateRecipeDto.isActive !== undefined) {
      recipe.isActive = updateRecipeDto.isActive;
    }

    if (updateRecipeDto.isFeatured !== undefined) {
      recipe.isFeatured = updateRecipeDto.isFeatured;
    }

    if (updateRecipeDto.mainProductUuids !== undefined) {
      recipe.mainProducts = await this.getProductsFromDto(
        updateRecipeDto.mainProductUuids,
        'UNO O VARIOS PRODUCTOS PRINCIPALES NO EXISTEN.',
      );
    }

    if (updateRecipeDto.productUuids !== undefined) {
      recipe.products = await this.getProductsFromDto(
        updateRecipeDto.productUuids,
        'UNO O VARIOS PRODUCTOS RECOMENDADOS NO EXISTEN.',
      );
    }

    return this.recipesRepository.saveRecipe(recipe);
  }

  async deleteRecipeService(uuid: string) {
    const recipe = await this.recipesRepository.findRecipeByUuid(uuid);

    if (!recipe) {
      throw new NotFoundException('LA RECETA NO EXISTE.');
    }

    await this.recipesRepository.removeRecipe(recipe);

    return {
      message: 'RECETA ELIMINADA CORRECTAMENTE.',
    };
  }

  async getMainProductUuidsWithActiveRecipesService() {
    return this.recipesRepository.findMainProductUuidsWithActiveRecipes();
  }

  private async getProductsFromDto(productUuids?: string[], errorMessage?: string) {
    if (!productUuids || productUuids.length === 0) {
      return [];
    }

    const uniqueProductUuids = [...new Set(productUuids)];

    const products =
      await this.recipesRepository.findProductsByUuids(uniqueProductUuids);

    if (products.length !== uniqueProductUuids.length) {
      throw new BadRequestException(
        errorMessage || 'UNO O VARIOS PRODUCTOS RELACIONADOS NO EXISTEN.',
      );
    }

    return products;
  }

  private cleanTextArray(values?: string[]) {
    if (!values || values.length === 0) {
      return null;
    }

    const cleanedValues = values
      .map((value) => value.trim())
      .filter(Boolean);

    return cleanedValues.length ? cleanedValues : null;
  }
}