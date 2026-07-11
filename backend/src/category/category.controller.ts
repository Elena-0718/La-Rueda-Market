import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { CategoriesService } from './category.service';


import { Roles } from '../enum/roles.enum';

import { RolesDecorator } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener categorías activas | Público',
    description:
      'Permite obtener las categorías visibles del catálogo de La Rueda Market.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías activas obtenida correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  findAllActive() {
    return this.categoriesService.findAllActive();
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener todas las categorías, activas e inactivas | Admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de categorías obtenida correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'Obtener categoría por UUID | Público',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID de la categoría.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría encontrada.',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada.',
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.categoriesService.findOne(uuid);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Crear categoría | Admin',
  })
  @ApiBody({
    description: 'Datos para crear una categoría.',
    type: CreateCategoryDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al crear la categoría.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 409,
    description: 'La categoría ya existe.',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Actualizar categoría | Admin',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID de la categoría a actualizar.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiBody({
    description: 'Datos para actualizar una categoría.',
    type: UpdateCategoryDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al actualizar la categoría.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada.',
  })
  @ApiResponse({
    status: 409,
    description: 'La categoría ya existe.',
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(uuid, dto);
  }

  @Delete(':uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Desactivar categoría con borrado lógico | Admin',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID de la categoría a desactivar.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría desactivada correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada.',
  })
  @HttpCode(HttpStatus.OK)
  delete(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.categoriesService.delete(uuid);
  }
}