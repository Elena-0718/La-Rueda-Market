import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesDecorator } from 'src/decorators/roles.decorator';
import { Roles } from 'src/enum/roles.enum';

import { CartDetailService } from './cart-detail.service';
import { AddProductDto } from './dtos/add-product.dto';
import { UpdateProductQuantityDto } from './dtos/update-cartdetail.dto';

@ApiTags('Detalles del carrito')
@ApiBearerAuth()
@Controller('cart-details')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartDetailController {
  constructor(private readonly cartDetailService: CartDetailService) {}

  /* =========================
     AGREGAR PRODUCTO
  ========================= */
  @Post('add-product')
  @ApiOperation({
    summary: 'Agregar producto al carrito activo | CLIENT',
  })
  @ApiBody({ type: AddProductDto })
  @ApiResponse({
    status: 200,
    description: 'Producto agregado al carrito correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.CLIENT)
  addProductToCart(
    @Req() req,
    @Body() addProductDto: AddProductDto,
  ) {
    return this.cartDetailService.addProductToCartService(
      req,
      addProductDto,
    );
  }

  /* =========================
     ACTUALIZAR CANTIDAD
  ========================= */
  @Put('update-product-quantity/:uuid')
  @ApiOperation({
    summary: 'Actualizar cantidad de producto en carrito | CLIENT',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del detalle del carrito.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiBody({ type: UpdateProductQuantityDto })
  @ApiResponse({
    status: 200,
    description: 'Cantidad actualizada correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.CLIENT)
  updateProductQuantity(
    @Req() req,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateProductQuantityDto,
  ) {
    return this.cartDetailService.updateProductQuantityService(
      req,
      uuid,
      dto,
    );
  }

  /* =========================
     ELIMINAR PRODUCTO
  ========================= */
  @Delete('delete-product/:uuid')
  @ApiOperation({
    summary: 'Eliminar producto del carrito | CLIENT',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del detalle del carrito.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado del carrito correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.CLIENT)
  deleteProductFromCart(
    @Req() req,
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.cartDetailService.deleteProductFromCartService(
      req,
      uuid,
    );
  }
}