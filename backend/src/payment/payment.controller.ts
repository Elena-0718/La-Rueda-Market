import {
  Body,
  Controller,
  Delete,
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

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesDecorator } from '../decorators/roles.decorator';
import { Roles } from '../enum/roles.enum';

import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { UpdatePaymentDto } from './dtos/update-payment.dto';

@ApiTags('Pagos')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  /* =========================
     ADMIN: LISTAR TODOS LOS PAGOS
  ========================= */
  @Get('admin/all')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Listar todos los pagos | ADMIN',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de pagos obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getAllPayments() {
    return this.paymentService.getAllPaymentsService();
  }

  /* =========================
     ADMIN: CONFIRMAR PAGO
  ========================= */
  @Put('admin/confirm/:uuid')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Confirmar pago | ADMIN',
    description:
      'Confirma un pago pendiente y actualiza el pedido asociado a CONFIRMED.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del pago.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Pago confirmado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  confirmPayment(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.paymentService.confirmPaymentService(uuid);
  }

  /* =========================
     ADMIN: ACTUALIZAR ESTADO DE PAGO
  ========================= */
  @Put('admin/status/:uuid')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Actualizar estado de pago | ADMIN',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del pago.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiBody({
    type: UpdatePaymentDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del pago actualizado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  updatePaymentStatus(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.paymentService.updatePaymentStatusService(
      uuid,
      dto,
    );
  }

  /* =========================
     ADMIN: RECHAZAR PAGO
  ========================= */
  @Delete('admin/reject/:uuid')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Rechazar pago | ADMIN',
    description:
      'Marca el pago como rechazado. No elimina el registro.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del pago.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Pago rechazado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  rejectPayment(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.paymentService.rejectPaymentService(uuid);
  }

  /* =========================
     CLIENTE: REGISTRAR PAGO
  ========================= */
  @Post('checkout')
  @RolesDecorator(Roles.CLIENT)
  @ApiOperation({
    summary: 'Registrar pago de un pedido | CLIENT',
    description:
      'Crea un pago pendiente asociado a un pedido del cliente autenticado.',
  })
  @ApiBody({
    type: CreatePaymentDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Pago registrado correctamente.',
  })
  @HttpCode(HttpStatus.CREATED)
  createPayment(
    @Req() req: any,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentService.createPaymentService(req, dto);
  }

  /* =========================
     SHARED: CONSULTAR PAGO
  ========================= */
  @Get(':uuid')
  @RolesDecorator(Roles.ADMIN, Roles.CLIENT)
  @ApiOperation({
    summary: 'Consultar pago por UUID | ADMIN o CLIENT dueño',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del pago.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Pago obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getPaymentByUuid(
    @Req() req: any,
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.paymentService.getPaymentByUuidService(
      uuid,
      req,
    );
  }
}