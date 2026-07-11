import {
  Controller,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../enum/roles.enum';
import { RolesDecorator } from '../decorators/roles.decorator';

@ApiTags('Carrito')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /* =========================
     CLIENTE: OBTENER CARRITO ACTIVO
  ========================= */
  @Get()
  @ApiOperation({
    summary: 'Obtener carrito activo | CLIENT',
    description:
      'Obtiene el carrito activo del cliente autenticado. Si no existe, se crea automáticamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito activo obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.CLIENT)
  getActiveCart(@Req() req) {
    const userUuid = req.user.user_uuid;

    return this.cartService.getOrCreateActiveCart(userUuid);
  }

  /* =========================
     CLIENTE: VACIAR CARRITO ACTIVO
  ========================= */
  @Delete('empty')
  @ApiOperation({
    summary: 'Vaciar carrito activo | CLIENT',
    description:
      'Elimina todos los productos del carrito activo del cliente autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito vaciado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.CLIENT)
  clearCart(@Req() req) {
    const userUuid = req.user.user_uuid;

    return this.cartService.clearActiveCart(userUuid);
  }

  /* =========================
     CLIENTE: CANCELAR CARRITO ACTIVO
  ========================= */
  @Delete('cancel')
  @ApiOperation({
    summary: 'Cancelar carrito activo | CLIENT',
    description:
      'Cancela el carrito activo del cliente autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito cancelado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.CLIENT)
  cancelCart(@Req() req) {
    const userUuid = req.user.user_uuid;

    return this.cartService.cancelActiveCart(userUuid);
  }

  /* =========================
     ADMIN: LISTAR TODOS LOS CARRITOS
  ========================= */
  @Get('admin/all')
  @ApiOperation({
    summary: 'Listar todos los carritos | ADMIN',
    description:
      'Permite al administrador consultar todos los carritos del sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de carritos obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  getAllCarts() {
    return this.cartService.getAllCarts();
  }

  /* =========================
     ADMIN: OBTENER CARRITO POR UUID
  ========================= */
  @Get('admin/:uuid')
  @ApiOperation({
    summary: 'Obtener carrito por UUID | ADMIN',
    description:
      'Permite al administrador consultar un carrito específico por UUID.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del carrito',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito encontrado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  getCartByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.cartService.getCartByUuid(uuid);
  }
}
