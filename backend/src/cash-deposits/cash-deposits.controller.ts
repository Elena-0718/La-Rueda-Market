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

import { CashDepositsService } from './cash-deposits.service';
import { CreateCashDepositDto } from './dtos/create-cash-deposit.dto';
import { UpdateCashDepositDto } from './dtos/update-cash-deposit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../enum/roles.enum';
import { RolesDecorator } from '../decorators/roles.decorator';

@ApiTags('Consignaciones de caja')
@ApiBearerAuth()
@Controller('cash-deposits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CashDepositsController {
  constructor(private readonly cashDepositsService: CashDepositsService) {}

  @Get('admin')
  @ApiOperation({
    summary: 'Listar consignaciones activas | ADMIN',
    description:
      'Permite consultar consignaciones activas, opcionalmente filtradas por fecha.',
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
    description: 'Consignaciones obtenidas correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  findAllActive(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.cashDepositsService.findAllActive(startDate, endDate);
  }

  @Get('admin/all')
  @ApiOperation({
    summary: 'Listar todas las consignaciones | ADMIN',
    description:
      'Permite consultar consignaciones activas y anuladas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado completo obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  findAll() {
    return this.cashDepositsService.findAll();
  }

  @Get('admin/summary')
  @ApiOperation({
    summary: 'Resumen de consignaciones | ADMIN',
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
    return this.cashDepositsService.getSummary(startDate, endDate);
  }

  @Get('admin/:uuid')
  @ApiOperation({
    summary: 'Obtener consignación por UUID | ADMIN',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID de la consignación',
  })
  @ApiResponse({
    status: 200,
    description: 'Consignación encontrada correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.cashDepositsService.findOne(uuid);
  }

  @Post('admin')
  @ApiOperation({
    summary: 'Registrar consignación | ADMIN',
  })
  @ApiResponse({
    status: 201,
    description: 'Consignación registrada correctamente.',
  })
  @HttpCode(HttpStatus.CREATED)
  @RolesDecorator(Roles.ADMIN)
  create(@Body() dto: CreateCashDepositDto) {
    return this.cashDepositsService.create(dto);
  }

  @Patch('admin/:uuid')
  @ApiOperation({
    summary: 'Actualizar consignación | ADMIN',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID de la consignación',
  })
  @ApiResponse({
    status: 200,
    description: 'Consignación actualizada correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateCashDepositDto,
  ) {
    return this.cashDepositsService.update(uuid, dto);
  }

  @Delete('admin/:uuid')
  @ApiOperation({
    summary: 'Anular consignación | ADMIN',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID de la consignación',
  })
  @ApiResponse({
    status: 200,
    description: 'Consignación anulada correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  delete(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.cashDepositsService.delete(uuid);
  }
}