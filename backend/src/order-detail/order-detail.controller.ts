import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesDecorator } from '../decorators/roles.decorator';
import { Roles } from '../enum/roles.enum';

import { OrderDetailService } from './order-detail.service';

@ApiTags('Detalles de pedidos')
@ApiBearerAuth()
@Controller('order-details')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderDetailController {
  constructor(
    private readonly orderDetailService: OrderDetailService,
  ) {}

  /* =========================
     ADMIN: VER DETALLES DE CUALQUIER PEDIDO
  ========================= */
  @Get('admin/:uuid')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Ver detalles de un pedido | ADMIN',
    description:
      'Permite al administrador consultar los productos que componen cualquier pedido.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del pedido.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del pedido obtenidos correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getOrderDetailsAdmin(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.orderDetailService.getOrderDetailsAdminService(uuid);
  }

  /* =========================
     CLIENTE: VER DETALLES DE SU PEDIDO
  ========================= */
  @Get('my-order/:uuid')
  @RolesDecorator(Roles.CLIENT)
  @ApiOperation({
    summary: 'Ver detalles de mi pedido | CLIENT',
    description:
      'Permite al cliente consultar los productos que componen uno de sus pedidos.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del pedido.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del pedido obtenidos correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getOrderDetailsClient(
    @Req() req: any,
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.orderDetailService.getOrderDetailsClientService(
      req,
      uuid,
    );
  }
}