import {
  Body,
  Controller,
  Get,
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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesDecorator } from '../decorators/roles.decorator';
import { Roles } from '../enum/roles.enum';
import { CreateDeliveryDto } from './dtos/create-delivery.dto';
import { UpdateDeliveryStatusDto } from './dtos/update-delivery-status.dto';

@ApiTags('Domicilios')
@ApiBearerAuth()
@Controller('deliveries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  constructor(
    private readonly deliveryService: DeliveryService,
  ) {}

  /* =========================
     ADMIN: LISTAR TODOS LOS DOMICILIOS
  ========================= */
  @Get('admin/all')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Listar todos los domicilios | ADMIN',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de domicilios obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getAllDeliveries() {
    return this.deliveryService.getAllDeliveriesService();
  }

  /* =========================
     ADMIN: CREAR DOMICILIO
  ========================= */
  @Post('admin')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Crear domicilio para un pedido | ADMIN',
    description:
      'Crea un domicilio a partir de los datos de entrega guardados en el pedido.',
  })
  @ApiBody({
    type: CreateDeliveryDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Domicilio creado correctamente.',
  })
  @HttpCode(HttpStatus.CREATED)
  createDelivery(
    @Body() dto: CreateDeliveryDto,
  ) {
    return this.deliveryService.createDeliveryService(dto);
  }

  /* =========================
     ADMIN: ACTUALIZAR ESTADO
  ========================= */
  @Put('admin/:uuid/status')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Actualizar estado de domicilio | ADMIN',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del domicilio.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiBody({
    type: UpdateDeliveryStatusDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del domicilio actualizado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  updateDeliveryStatus(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateDeliveryStatusDto,
  ) {
    return this.deliveryService.updateDeliveryStatusService(
      uuid,
      dto,
    );
  }

  /* =========================
     SHARED: CONSULTAR DOMICILIO
  ========================= */
  @Get(':uuid')
  @RolesDecorator(Roles.ADMIN, Roles.CLIENT)
  @ApiOperation({
    summary: 'Consultar domicilio por UUID | ADMIN o CLIENT dueño',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del domicilio.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Domicilio obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getDeliveryByUuid(
    @Req() req: any,
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.deliveryService.getDeliveryByUuidService(
      uuid,
      req,
    );
  }
}