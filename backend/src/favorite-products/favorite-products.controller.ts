import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FavoriteProductsService } from './favorite-products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../enum/roles.enum';
import { RolesDecorator } from '../decorators/roles.decorator';

@ApiTags('Productos favoritos')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FavoriteProductsController {
  constructor(
    private readonly favoriteProductsService: FavoriteProductsService,
  ) {}

  @Get('my-products')
  @ApiOperation({
    summary: 'Listar mis productos favoritos | CLIENT',
    description:
      'Permite al cliente autenticado consultar sus productos favoritos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de favoritos obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.CLIENT)
  getMyFavorites(@Req() req) {
    const userUuid = req.user.user_uuid;

    return this.favoriteProductsService.getMyFavorites(userUuid);
  }

  @Get('my-product-uuids')
  @ApiOperation({
    summary: 'Listar UUID de mis productos favoritos | CLIENT',
    description:
      'Devuelve solo los UUID de los productos favoritos del cliente autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de UUID favoritos obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.CLIENT)
  getMyFavoriteProductUuids(@Req() req) {
    const userUuid = req.user.user_uuid;

    return this.favoriteProductsService.getMyFavoriteProductUuids(userUuid);
  }

  @Post(':productUuid')
  @ApiOperation({
    summary: 'Agregar producto a favoritos | CLIENT',
    description:
      'Permite al cliente autenticado marcar un producto como favorito.',
  })
  @ApiParam({
    name: 'productUuid',
    description: 'UUID del producto',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto agregado a favoritos correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.CLIENT)
  addFavorite(
    @Req() req,
    @Param('productUuid', ParseUUIDPipe) productUuid: string,
  ) {
    const userUuid = req.user.user_uuid;

    return this.favoriteProductsService.addFavorite(userUuid, productUuid);
  }

  @Post('toggle/:productUuid')
  @ApiOperation({
    summary: 'Agregar o quitar producto favorito | CLIENT',
    description:
      'Si el producto no está en favoritos, lo agrega. Si ya está, lo quita.',
  })
  @ApiParam({
    name: 'productUuid',
    description: 'UUID del producto',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Favorito actualizado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.CLIENT)
  toggleFavorite(
    @Req() req,
    @Param('productUuid', ParseUUIDPipe) productUuid: string,
  ) {
    const userUuid = req.user.user_uuid;

    return this.favoriteProductsService.toggleFavorite(userUuid, productUuid);
  }

  @Delete(':productUuid')
  @ApiOperation({
    summary: 'Quitar producto de favoritos | CLIENT',
    description:
      'Permite al cliente autenticado quitar un producto de sus favoritos.',
  })
  @ApiParam({
    name: 'productUuid',
    description: 'UUID del producto',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto quitado de favoritos correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.CLIENT)
  removeFavorite(
    @Req() req,
    @Param('productUuid', ParseUUIDPipe) productUuid: string,
  ) {
    const userUuid = req.user.user_uuid;

    return this.favoriteProductsService.removeFavorite(userUuid, productUuid);
  }
}