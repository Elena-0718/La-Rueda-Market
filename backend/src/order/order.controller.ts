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
import { AdjustOrderDetailsDto } from './dtos/adjust-order-details.dto';

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
    description:
      'Permite cambiar el estado del pedido. Si el pedido se marca como DELIVERED, el sistema descuenta inventario de los productos físicos controlados.',
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
  @ApiResponse({
    status: 400,
    description:
      'Error al actualizar el estado. Puede ocurrir si no hay stock suficiente al marcar como entregado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido no encontrado.',
  })
  @HttpCode(HttpStatus.OK)
  updateOrderStatus(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orderService.updateOrderStatusService(uuid, dto);
  }

  /* =========================
     ADMIN: AJUSTAR PRODUCTOS DEL PEDIDO
  ========================= */
  @Patch('admin/:uuid/adjust-details')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Ajustar productos de un pedido antes de entregarlo | ADMIN',
    description:
      'Permite cambiar cantidades, cambiar precio unitario o quitar productos que no se consiguieron. El sistema recalcula subtotal, impuestos y total del pedido.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del pedido a ajustar.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiBody({
    description:
      'Lista de ajustes para los productos del pedido. Si keep es false o quantity es 0, el producto se elimina del pedido.',
    type: AdjustOrderDetailsDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido ajustado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Error al ajustar el pedido. No se puede dejar un pedido sin productos.',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido o detalle de pedido no encontrado.',
  })
  @HttpCode(HttpStatus.OK)
  adjustOrderDetails(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: AdjustOrderDetailsDto,
  ) {
    return this.orderService.adjustOrderDetailsService(uuid, dto);
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
  @ApiResponse({
    status: 404,
    description: 'Pedido no encontrado.',
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
  @ApiResponse({
    status: 400,
    description: 'Error al crear pedido desde el carrito.',
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
  @ApiResponse({
    status: 404,
    description: 'Pedido no encontrado.',
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
  @ApiResponse({
    status: 404,
    description: 'Pedido no encontrado.',
  })
  @HttpCode(HttpStatus.OK)
  getOrderByUuid(
    @Req() req: any,
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.orderService.getOrderByUuidService(uuid, req);
  }
}  