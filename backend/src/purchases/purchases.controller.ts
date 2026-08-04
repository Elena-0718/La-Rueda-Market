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
  Query,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';


import { Roles } from '../enum/roles.enum';
import { RolesDecorator } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePurchaseDto } from './dtos/create-purchase.dto';
import { PurchasesService } from './purchases.service';
import { UpdatePurchaseDto } from './dtos/update-purchase.dto';

@ApiTags('Purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(
    private readonly purchasesService: PurchasesService,
  ) {}

  @Get('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener compras activas | Admin',
    description:
      'Permite listar compras de productos activas. Puede filtrarse por rango de fechas.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    example: '2026-08-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    example: '2026-08-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de compras obtenida correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  findAllActive(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.purchasesService.findAllActive(startDate, endDate);
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener todas las compras, activas e inactivas | Admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de compras obtenida correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.purchasesService.findAll();
  }

  @Get('admin/summary')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener resumen de compras/costos | Admin',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    example: '2026-08-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    example: '2026-08-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de compras obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.purchasesService.getSummary(startDate, endDate);
  }

  @Get('admin/:uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener compra por UUID | Admin',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID de la compra.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Compra encontrada.',
  })
  @ApiResponse({
    status: 404,
    description: 'Compra no encontrada.',
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.purchasesService.findOne(uuid);
  }

  @Post('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Crear compra de productos | Admin',
  })
  @ApiBody({
    description: 'Datos para crear una compra de productos.',
    type: CreatePurchaseDto,
  })
  @ApiResponse({
    status: 201,
    description:
      'Compra creada correctamente. Puede actualizar precios y registrar entradas de inventario.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al crear la compra.',
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
  create(@Body() dto: CreatePurchaseDto) {
    return this.purchasesService.create(dto);
  }

  @Patch('admin/:uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Actualizar datos generales de una compra | Admin',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID de la compra a actualizar.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiBody({
    description:
      'Datos generales para actualizar una compra. No modifica detalles ni inventario.',
    type: UpdatePurchaseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Compra actualizada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al actualizar la compra.',
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
    description: 'Compra no encontrada.',
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdatePurchaseDto,
  ) {
    return this.purchasesService.update(uuid, dto);
  }

  @Delete('admin/:uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Desactivar compra con borrado lógico | Admin',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID de la compra a desactivar.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Compra desactivada correctamente.',
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
    description: 'Compra no encontrada.',
  })
  @HttpCode(HttpStatus.OK)
  delete(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.purchasesService.delete(uuid);
  }
}