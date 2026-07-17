import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import {
  RecipeCategory,
  RecipeDifficulty,
} from '../../entities/recipe.entity';

export class CreateRecipeDto {
  @ApiProperty({
    example: 'Pastas con carne molida',
    description: 'Título de la receta.',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Una receta fácil y rendidora para preparar en familia.',
    description: 'Descripción corta de la receta.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    example: 'https://www.youtube.com/watch?v=abc123',
    description: 'URL del video de la receta.',
  })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({
    example: '/upload/recipes/pastas-carne.jpg',
    description: 'Imagen de la receta, si aplica.',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    enum: RecipeCategory,
    example: RecipeCategory.BEEF,
    description: 'Categoría de la receta.',
  })
  @IsOptional()
  @IsEnum(RecipeCategory)
  category?: RecipeCategory;

  @ApiPropertyOptional({
    enum: RecipeDifficulty,
    example: RecipeDifficulty.EASY,
    description: 'Dificultad de la receta.',
  })
  @IsOptional()
  @IsEnum(RecipeDifficulty)
  difficulty?: RecipeDifficulty;

  @ApiPropertyOptional({
    example: 30,
    description: 'Tiempo de preparación en minutos.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  preparationTime?: number;

  @ApiPropertyOptional({
    example: 4,
    description: 'Número de porciones sugeridas.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  servings?: number;

  @ApiPropertyOptional({
    example:
      'Puedes prepararla con carne molida de res, cerdo o pollo. Elige la proteína que prefieras.',
    description: 'Notas para explicar alternativas o recomendaciones.',
  })
  @IsOptional()
  @IsString()
  ingredientNotes?: string;

  @ApiPropertyOptional({
    example: [
      'Cocina la pasta según las instrucciones del empaque.',
      'Sofríe tomate y cebolla.',
      'Agrega la carne molida y mezcla con la pasta.',
    ],
    description: 'Pasos de preparación.',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  steps?: string[];

  @ApiPropertyOptional({
    example: ['Sal', 'Pimienta', 'Agua'],
    description:
      'Ingredientes adicionales que no necesariamente están en catálogo.',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  extraIngredients?: string[];

  @ApiPropertyOptional({
    example: 'Puedes agregar queso rallado al final para mejorar el sabor.',
    description: 'Consejo adicional de preparación.',
  })
  @IsOptional()
  @IsString()
  tips?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si la receta está visible para el cliente.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si la receta será destacada.',
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: [
      '0f2f3c9b-5d5a-4d19-a0e4-1e74c6c88b20',
      '8d5f04d3-71ec-4dc5-91a0-38a7810a7f49',
    ],
    description:
      'UUIDs de productos principales que activan el botón VER RECETAS en el catálogo.',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  mainProductUuids?: string[];

  @ApiPropertyOptional({
    example: [
      '0f2f3c9b-5d5a-4d19-a0e4-1e74c6c88b20',
      '8d5f04d3-71ec-4dc5-91a0-38a7810a7f49',
    ],
    description:
      'UUIDs de productos recomendados que se muestran dentro de la receta.',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  productUuids?: string[];
}