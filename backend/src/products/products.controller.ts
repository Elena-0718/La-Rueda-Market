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
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { ProductsService } from './products.service';

import { RolesDecorator } from '../decorators/roles.decorator';
import { Roles } from '../enum/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateProductDto } from './dtos/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProductDto } from './dtos/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los productos activos | Público',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getAll() {
    return this.productsService.getAllProducts();
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'Obtener producto por UUID | Público',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del producto.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado.',
  })
  @HttpCode(HttpStatus.OK)
  getById(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.productsService.getProductById(uuid);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Crear nuevo producto | Admin',
  })
  @ApiBody({
    description: 'Datos para crear un producto.',
    type: CreateProductDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Producto creado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al crear producto.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado.',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Patch(':uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Actualizar producto | Admin',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del producto a actualizar.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiBody({
    description: 'Datos a actualizar.',
    type: UpdateProductDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado.',
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(uuid, dto);
  }

  @Delete(':uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Eliminar producto con borrado lógico | Admin',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del producto a eliminar.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado.',
  })
  @HttpCode(HttpStatus.OK)
  delete(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.productsService.deleteProduct(uuid);
  }
}
