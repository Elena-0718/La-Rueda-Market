import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CashClosing } from '../entities/cash-closing.entity';
import { CashClosingsController } from './cash-closings.controller';
import { CashClosingsService } from './cash-closings.service';
import { CashClosingsRepository } from './cash-closings.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CashClosing])],
  controllers: [CashClosingsController],
  providers: [CashClosingsService, CashClosingsRepository],
  exports: [CashClosingsService, CashClosingsRepository, TypeOrmModule],
})
export class CashClosingsModule {}