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

import { PhysicalSalesService } from './physical-sales.service';
import { Roles } from '../enum/roles.enum';
import { RolesDecorator } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePhysicalSaleDto } from './dtos/create-physical-sale.dto';
import { UpdatePhysicalSaleDto } from './dtos/update-physical-sale.dto';

@ApiTags('Physical Sales')
@Controller('physical-sales')
export class PhysicalSalesController {
  constructor(
    private readonly physicalSalesService: PhysicalSalesService,
  ) {}

  @Get('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener ventas físicas activas | Admin',
    description:
      'Permite listar ventas físicas registradas en el local. Puede filtrarse por rango de fechas.',
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
    description: 'Lista de ventas físicas obtenida correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  findAllActive(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.physicalSalesService.findAllActive(startDate, endDate);
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener todas las ventas físicas, activas e inactivas | Admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de ventas físicas obtenida correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.physicalSalesService.findAll();
  }

  @Get('admin/summary')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener resumen de ingresos por ventas físicas | Admin',
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
    description: 'Resumen de ventas físicas obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.physicalSalesService.getSummary(startDate, endDate);
  }

  @Get('admin/:uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener venta física por UUID | Admin',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID de la venta física.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Venta física encontrada.',
  })
  @ApiResponse({
    status: 404,
    description: 'Venta física no encontrada.',
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.physicalSalesService.findOne(uuid);
  }

  @Post('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Crear venta física | Admin',
  })
  @ApiBody({
    description:
      'Datos para registrar una venta física. Descuenta inventario y crea movimiento STORE_SALE.',
    type: CreatePhysicalSaleDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Venta física creada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al crear la venta física.',
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
  create(@Body() dto: CreatePhysicalSaleDto) {
    return this.physicalSalesService.create(dto);
  }

  @Patch('admin/:uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Actualizar datos generales de una venta física | Admin',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID de la venta física a actualizar.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiBody({
    description:
      'Datos generales para actualizar una venta física. No modifica detalles ni stock.',
    type: UpdatePhysicalSaleDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Venta física actualizada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al actualizar la venta física.',
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
    description: 'Venta física no encontrada.',
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdatePhysicalSaleDto,
  ) {
    return this.physicalSalesService.update(uuid, dto);
  }

  @Delete('admin/:uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Desactivar venta física con borrado lógico | Admin',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID de la venta física a desactivar.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Venta física desactivada correctamente.',
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
    description: 'Venta física no encontrada.',
  })
  @HttpCode(HttpStatus.OK)
  delete(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.physicalSalesService.delete(uuid);
  }
}