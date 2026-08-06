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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CashClosingsService } from './cash-closings.service';
import { CreateCashClosingDto } from './dtos/create-cash-closing.dto';
import { UpdateCashClosingDto } from './dtos/update-cash-closing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../enum/roles.enum';
import { RolesDecorator } from '../decorators/roles.decorator';

@ApiTags('Cierres de caja')
@ApiBearerAuth()
@Controller('cash-closings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CashClosingsController {
  constructor(private readonly cashClosingsService: CashClosingsService) {}

  @Get('admin')
  @ApiOperation({
    summary: 'Listar cierres de caja activos | ADMIN',
    description:
      'Permite consultar los cierres de caja activos, opcionalmente filtrados por fecha.',
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
    description: 'Cierres de caja obtenidos correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  findAllActive(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.cashClosingsService.findAllActive(startDate, endDate);
  }

  @Get('admin/all')
  @ApiOperation({
    summary: 'Listar todos los cierres de caja | ADMIN',
    description:
      'Permite consultar todos los cierres de caja, incluyendo anulados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado completo obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  findAll() {
    return this.cashClosingsService.findAll();
  }

  @Get('admin/summary')
  @ApiOperation({
    summary: 'Resumen de cierres de caja | ADMIN',
    description:
      'Permite consultar el resumen de cierres de caja, opcionalmente filtrado por fecha.',
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
    description: 'Resumen obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.cashClosingsService.getSummary(startDate, endDate);
  }

  @Get('admin/:uuid')
  @ApiOperation({
    summary: 'Obtener cierre de caja por UUID | ADMIN',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del cierre de caja',
  })
  @ApiResponse({
    status: 200,
    description: 'Cierre de caja encontrado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.cashClosingsService.findOne(uuid);
  }

  @Post('admin')
  @ApiOperation({
    summary: 'Registrar cierre de caja | ADMIN',
  })
  @ApiResponse({
    status: 201,
    description: 'Cierre de caja registrado correctamente.',
  })
  @HttpCode(HttpStatus.CREATED)
  @RolesDecorator(Roles.ADMIN)
  create(@Body() dto: CreateCashClosingDto) {
    return this.cashClosingsService.create(dto);
  }

  @Patch('admin/:uuid')
  @ApiOperation({
    summary: 'Actualizar cierre de caja | ADMIN',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del cierre de caja',
  })
  @ApiResponse({
    status: 200,
    description: 'Cierre de caja actualizado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateCashClosingDto,
  ) {
    return this.cashClosingsService.update(uuid, dto);
  }

  @Delete('admin/:uuid')
  @ApiOperation({
    summary: 'Anular cierre de caja | ADMIN',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del cierre de caja',
  })
  @ApiResponse({
    status: 200,
    description: 'Cierre de caja anulado correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  delete(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.cashClosingsService.delete(uuid);
  }
}