import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FinancialReportService } from './financial-report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesDecorator } from '../decorators/roles.decorator';
import { Roles } from '../enum/roles.enum';

@ApiTags('Financial Report')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('financial-report')
export class FinancialReportController {
  constructor(
    private readonly financialReportService: FinancialReportService,
  ) {}

  @Get('admin/summary')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener resumen financiero general | ADMIN',
    description:
      'Consolida ingresos por pedidos entregados, ingresos por ventas físicas, costos de compras y gastos operativos.',
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
    description: 'Resumen financiero obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialReportService.getSummary(
      startDate,
      endDate,
    );
  }

  @Get('admin/detail')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({
    summary: 'Obtener informe financiero detallado | ADMIN',
    description:
      'Devuelve resumen financiero y detalle de pedidos entregados, ventas físicas, compras y gastos.',
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
    description: 'Informe financiero detallado obtenido correctamente.',
  })
  @HttpCode(HttpStatus.OK)
  getDetailedReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialReportService.getDetailedReport(
      startDate,
      endDate,
    );
  }
}