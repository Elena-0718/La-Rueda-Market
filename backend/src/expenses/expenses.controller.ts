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
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { UpdateExpenseDto } from './dtos/update-expense.dto';
import { ExpensesService } from './expenses.service';

@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
  ) {}

  @Get('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener gastos operativos activos | Admin',
    description:
      'Permite listar los gastos operativos activos. Puede filtrarse por rango de fechas.',
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
    description: 'Lista de gastos obtenida correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  findAllActive(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.findAllActive(startDate, endDate);
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener todos los gastos, activos e inactivos | Admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de gastos obtenida correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.expensesService.findAll();
  }

  @Get('admin/summary')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener resumen de gastos operativos | Admin',
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
    description: 'Resumen de gastos obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.getSummary(startDate, endDate);
  }

  @Get('admin/:uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener gasto operativo por UUID | Admin',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del gasto operativo.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Gasto encontrado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Gasto no encontrado.',
  })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.expensesService.findOne(uuid);
  }

  @Post('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Crear gasto operativo | Admin',
  })
  @ApiBody({
    description: 'Datos para crear un gasto operativo.',
    type: CreateExpenseDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Gasto operativo creado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al crear el gasto.',
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
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.create(dto);
  }

  @Patch('admin/:uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Actualizar gasto operativo | Admin',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del gasto operativo a actualizar.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiBody({
    description: 'Datos para actualizar un gasto operativo.',
    type: UpdateExpenseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Gasto actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al actualizar el gasto.',
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
    description: 'Gasto no encontrado.',
  })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(uuid, dto);
  }

  @Delete('admin/:uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Desactivar gasto operativo con borrado lógico | Admin',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del gasto operativo a desactivar.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @ApiResponse({
    status: 200,
    description: 'Gasto desactivado correctamente.',
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
    description: 'Gasto no encontrado.',
  })
  @HttpCode(HttpStatus.OK)
  delete(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.expensesService.delete(uuid);
  }
}