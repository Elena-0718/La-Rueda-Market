import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CashDeposit } from '../entities/cash-deposit.entity';
import { CashDepositsController } from './cash-deposits.controller';
import { CashDepositsService } from './cash-deposits.service';
import { CashDepositsRepository } from './cash-deposits.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CashDeposit])],
  controllers: [CashDepositsController],
  providers: [CashDepositsService, CashDepositsRepository],
  exports: [CashDepositsService, CashDepositsRepository, TypeOrmModule],
})
export class CashDepositsModule {}