import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { CashClosing } from '../entities/cash-closing.entity';

@Injectable()
export class CashClosingsRepository {
  constructor(
    @InjectRepository(CashClosing)
    private readonly cashClosingsDB: Repository<CashClosing>,
  ) {}

  findAllActiveRepository(): Promise<CashClosing[]> {
    return this.cashClosingsDB.find({
      where: { isActive: true },
      order: { closingDate: 'DESC', createdAt: 'DESC' },
    });
  }

  findAllRepository(): Promise<CashClosing[]> {
    return this.cashClosingsDB.find({
      order: { closingDate: 'DESC', createdAt: 'DESC' },
    });
  }

  findAllActiveByDateRangeRepository(
    startDate: string,
    endDate: string,
  ): Promise<CashClosing[]> {
    return this.cashClosingsDB.find({
      where: {
        isActive: true,
        closingDate: Between(
          new Date(`${startDate}T00:00:00`),
          new Date(`${endDate}T23:59:59`),
        ),
      },
      order: { closingDate: 'DESC', createdAt: 'DESC' },
    });
  }

  findByIdRepository(uuid: string): Promise<CashClosing | null> {
    return this.cashClosingsDB.findOne({
      where: { uuid, isActive: true },
    });
  }

  findByIdIncludingInactiveRepository(
    uuid: string,
  ): Promise<CashClosing | null> {
    return this.cashClosingsDB.findOne({
      where: { uuid },
    });
  }

  createRepository(data: Partial<CashClosing>): CashClosing {
    return this.cashClosingsDB.create(data);
  }

  saveRepository(cashClosing: CashClosing): Promise<CashClosing> {
    return this.cashClosingsDB.save(cashClosing);
  }

  updateRepository(
    cashClosing: CashClosing,
    data: Partial<CashClosing>,
  ): Promise<CashClosing> {
    Object.assign(cashClosing, data);
    return this.cashClosingsDB.save(cashClosing);
  }

  async deleteRepository(cashClosing: CashClosing): Promise<{ message: string }> {
    cashClosing.isActive = false;
    await this.cashClosingsDB.save(cashClosing);

    return {
      message: 'El cierre de caja fue anulado correctamente.',
    };
  }
}