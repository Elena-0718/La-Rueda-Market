import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { CashDeposit } from '../entities/cash-deposit.entity';

@Injectable()
export class CashDepositsRepository {
  constructor(
    @InjectRepository(CashDeposit)
    private readonly cashDepositsDB: Repository<CashDeposit>,
  ) {}

  findAllActiveRepository(): Promise<CashDeposit[]> {
    return this.cashDepositsDB.find({
      where: { isActive: true },
      order: { depositDate: 'DESC', createdAt: 'DESC' },
    });
  }

  findAllRepository(): Promise<CashDeposit[]> {
    return this.cashDepositsDB.find({
      order: { depositDate: 'DESC', createdAt: 'DESC' },
    });
  }

  findAllActiveByDateRangeRepository(
    startDate: string,
    endDate: string,
  ): Promise<CashDeposit[]> {
    return this.cashDepositsDB.find({
      where: {
        isActive: true,
        depositDate: Between(
          new Date(`${startDate}T00:00:00`),
          new Date(`${endDate}T23:59:59`),
        ),
      },
      order: { depositDate: 'DESC', createdAt: 'DESC' },
    });
  }

  findByIdRepository(uuid: string): Promise<CashDeposit | null> {
    return this.cashDepositsDB.findOne({
      where: { uuid, isActive: true },
    });
  }

  findByIdIncludingInactiveRepository(
    uuid: string,
  ): Promise<CashDeposit | null> {
    return this.cashDepositsDB.findOne({
      where: { uuid },
    });
  }

  createRepository(data: Partial<CashDeposit>): CashDeposit {
    return this.cashDepositsDB.create(data);
  }

  saveRepository(cashDeposit: CashDeposit): Promise<CashDeposit> {
    return this.cashDepositsDB.save(cashDeposit);
  }

  updateRepository(
    cashDeposit: CashDeposit,
    data: Partial<CashDeposit>,
  ): Promise<CashDeposit> {
    Object.assign(cashDeposit, data);
    return this.cashDepositsDB.save(cashDeposit);
  }

  async deleteRepository(cashDeposit: CashDeposit): Promise<{ message: string }> {
    cashDeposit.isActive = false;
    await this.cashDepositsDB.save(cashDeposit);

    return {
      message: 'La consignación fue anulada correctamente.',
    };
  }
}