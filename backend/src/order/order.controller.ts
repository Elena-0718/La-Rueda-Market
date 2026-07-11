import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { OrderService } from './order.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesDecorator } from '../decorators/roles.decorator';
import { Roles } from '../enum/roles.enum';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { CreateOrderDto } from './dtos/create-order.dto';

@ApiTags('Pedidos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /* =========================
     ADMIN: LISTAR TODAS LAS ÓRDENES
  ========================= */
  @Get('admin/all')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Listar todos los pedidos | ADMIN',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de pedidos obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getAllOrders() {
    return this.orderService.getAllOrdersService();
  }

  /* =========================
     ADMIN: ACTUALIZAR ESTADO
  ========================= */
  @Patch('admin/:uuid/status')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Actualizar estado de un pedido | ADMIN',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del pedido.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiBody({
    type: UpdateOrderDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del pedido actualizado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  updateOrderStatus(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orderService.updateOrderStatusService(uuid, dto);
  }

  /* =========================
     ADMIN: CANCELAR ORDEN
  ========================= */
  @Delete('admin/:uuid')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Cancelar pedido | ADMIN',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del pedido.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido cancelado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  cancelOrderByAdmin(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.orderService.cancelOrderByAdminService(uuid);
  }

  /* =========================
     CLIENTE: CREAR ORDEN DESDE CARRITO
  ========================= */
  @Post()
  @RolesDecorator(Roles.CLIENT)
  @ApiOperation({
    summary: 'Crear pedido desde el carrito activo | CLIENT',
  })
  @ApiBody({
    type: CreateOrderDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido creado correctamente.',
  })
  @HttpCode(HttpStatus.CREATED)
  createOrder(
    @Req() req: any,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrderFromCartService(req, dto);
  }

  /* =========================
     CLIENTE: HISTORIAL DE PEDIDOS
  ========================= */
  @Get('my-orders')
  @RolesDecorator(Roles.CLIENT)
  @ApiOperation({
    summary: 'Consultar mis pedidos | CLIENT',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de pedidos obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getMyOrders(@Req() req: any) {
    return this.orderService.getMyOrdersService(req);
  }

  /* =========================
     CLIENTE: CANCELAR SU PEDIDO
  ========================= */
  @Patch(':uuid/cancel')
  @RolesDecorator(Roles.CLIENT)
  @ApiOperation({
    summary: 'Cancelar mi pedido | CLIENT',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del pedido.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido cancelado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  cancelMyOrder(
    @Req() req: any,
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.orderService.cancelMyOrderService(req, uuid);
  }

  /* =========================
     SHARED: DETALLE DE PEDIDO
  ========================= */
  @Get(':uuid')
  @ApiOperation({
    summary: 'Consultar detalle de pedido | ADMIN o dueño del pedido',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del pedido.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle del pedido obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getOrderByUuid(
    @Req() req: any,
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.orderService.getOrderByUuidService(uuid, req);
  }
}