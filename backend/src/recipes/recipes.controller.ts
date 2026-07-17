import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CreateRecipeDto } from './dtos/create-recipe.dto';
import { UpdateRecipeDto } from './dtos/update-recipe.dto';
import { RecipesService } from './recipes.service';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  /* =========================
     ADMIN
  ========================= */

  @Post('admin')
  @ApiOperation({ summary: 'Crear receta desde el panel admin' })
  createRecipe(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.createRecipeService(createRecipeDto);
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'Listar todas las recetas para admin' })
  getAllRecipesAdmin() {
    return this.recipesService.getAllRecipesAdminService();
  }

  @Get('admin/:uuid')
  @ApiOperation({ summary: 'Obtener receta por UUID para admin' })
  getRecipeByUuidAdmin(@Param('uuid') uuid: string) {
    return this.recipesService.getRecipeByUuidAdminService(uuid);
  }

  @Patch('admin/:uuid')
  @ApiOperation({ summary: 'Actualizar receta desde admin' })
  updateRecipe(
    @Param('uuid') uuid: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.updateRecipeService(uuid, updateRecipeDto);
  }

  @Delete('admin/:uuid')
  @ApiOperation({ summary: 'Eliminar receta desde admin' })
  deleteRecipe(@Param('uuid') uuid: string) {
    return this.recipesService.deleteRecipeService(uuid);
  }

  /* =========================
     CLIENTE / PÚBLICO
  ========================= */

  @Get()
  @ApiOperation({ summary: 'Listar recetas activas para clientes' })
  @ApiQuery({
    name: 'productUuid',
    required: false,
    description:
      'Filtra recetas relacionadas con un producto principal. Este filtro usa mainProducts, no products.',
  })
  getActiveRecipes(@Query('productUuid') productUuid?: string) {
    return this.recipesService.getActiveRecipesService(productUuid);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Obtener receta activa por UUID para cliente' })
  getActiveRecipeByUuid(@Param('uuid') uuid: string) {
    return this.recipesService.getActiveRecipeByUuidService(uuid);
  }
}