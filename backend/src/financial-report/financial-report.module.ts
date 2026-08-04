import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from '../entities/order.entity';
import { PhysicalSale } from '../entities/physical-sale.entity';
import { Purchase } from '../entities/purchase.entity';
import { Expense } from '../entities/expense.entity';

import { FinancialReportController } from './financial-report.controller';
import { FinancialReportService } from './financial-report.service';
import { FinancialReportRepository } from './financial-report.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      PhysicalSale,
      Purchase,
      Expense,
    ]),
  ],
  controllers: [FinancialReportController],
  providers: [
    FinancialReportService,
    FinancialReportRepository,
  ],
  exports: [
    FinancialReportService,
    FinancialReportRepository,
  ],
})
export class FinancialReportModule {}