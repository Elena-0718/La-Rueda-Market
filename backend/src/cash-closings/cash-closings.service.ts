import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CashClosing } from '../entities/cash-closing.entity';
import { CashClosingsRepository } from './cash-closings.repository';
import { CreateCashClosingDto } from './dtos/create-cash-closing.dto';
import { UpdateCashClosingDto } from './dtos/update-cash-closing.dto';

@Injectable()
export class CashClosingsService {
  constructor(
    private readonly cashClosingsRepository: CashClosingsRepository,
  ) {}

  async findAllActive(
    startDate?: string,
    endDate?: string,
  ): Promise<CashClosing[]> {
    if (startDate && endDate) {
      return this.cashClosingsRepository.findAllActiveByDateRangeRepository(
        startDate,
        endDate,
      );
    }

    return this.cashClosingsRepository.findAllActiveRepository();
  }

  async findAll(): Promise<CashClosing[]> {
    return this.cashClosingsRepository.findAllRepository();
  }

  async findOne(uuid: string): Promise<CashClosing> {
    const cashClosing =
      await this.cashClosingsRepository.findByIdRepository(uuid);

    if (!cashClosing) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ UN CIERRE DE CAJA ACTIVO CON EL ID ${uuid}.`,
      );
    }

    return cashClosing;
  }

  async getSummary(startDate?: string, endDate?: string) {
    const closings = await this.findAllActive(startDate, endDate);

    const totalInitialCash = closings.reduce(
      (total, closing) => total + Number(closing.initialCash || 0),
      0,
    );

    const totalCashSales = closings.reduce(
      (total, closing) => total + Number(closing.cashSales || 0),
      0,
    );

    const totalCashOrderPayments = closings.reduce(
      (total, closing) => total + Number(closing.cashOrderPayments || 0),
      0,
    );

    const totalCashExpenses = closings.reduce(
      (total, closing) => total + Number(closing.cashExpenses || 0),
      0,
    );

    const totalCashDeposits = closings.reduce(
      (total, closing) => total + Number(closing.cashDeposits || 0),
      0,
    );

    const totalCashWithdrawals = closings.reduce(
      (total, closing) => total + Number(closing.cashWithdrawals || 0),
      0,
    );

    const totalDifference = closings.reduce(
      (total, closing) => total + Number(closing.difference || 0),
      0,
    );

    return {
      totalRecords: closings.length,
      totalInitialCash: this.roundMoney(totalInitialCash),
      totalCashSales: this.roundMoney(totalCashSales),
      totalCashOrderPayments: this.roundMoney(totalCashOrderPayments),
      totalCashExpenses: this.roundMoney(totalCashExpenses),
      totalCashDeposits: this.roundMoney(totalCashDeposits),
      totalCashWithdrawals: this.roundMoney(totalCashWithdrawals),
      totalDifference: this.roundMoney(totalDifference),
    };
  }

  async create(dto: CreateCashClosingDto): Promise<CashClosing> {
    const initialCash = this.roundMoney(Number(dto.initialCash || 0));
    const cashSales = this.roundMoney(Number(dto.cashSales || 0));
    const cashOrderPayments = this.roundMoney(
      Number(dto.cashOrderPayments || 0),
    );
    const cashExpenses = this.roundMoney(Number(dto.cashExpenses || 0));
    const cashDeposits = this.roundMoney(Number(dto.cashDeposits || 0));
    const cashWithdrawals = this.roundMoney(Number(dto.cashWithdrawals || 0));
    const countedCash = this.roundMoney(Number(dto.countedCash || 0));

    const expectedCash = this.calculateExpectedCash({
      initialCash,
      cashSales,
      cashOrderPayments,
      cashExpenses,
      cashDeposits,
      cashWithdrawals,
    });

    const difference = this.roundMoney(countedCash - expectedCash);

    const cashClosing = this.cashClosingsRepository.createRepository({
      closingDate: this.parseDateOnly(dto.closingDate),
      responsibleName: dto.responsibleName?.trim() || null,
      initialCash,
      cashSales,
      cashOrderPayments,
      cashExpenses,
      cashDeposits,
      cashWithdrawals,
      expectedCash,
      countedCash,
      difference,
      notes: dto.notes?.trim() || null,
      isActive: true,
    });

    try {
      return await this.cashClosingsRepository.saveRepository(cashClosing);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'OCURRIÓ UN ERROR AL REGISTRAR EL CIERRE DE CAJA.';

      throw new BadRequestException(message);
    }
  }

  async update(
    uuid: string,
    dto: UpdateCashClosingDto,
  ): Promise<CashClosing> {
    const cashClosing =
      await this.cashClosingsRepository.findByIdIncludingInactiveRepository(
        uuid,
      );

    if (!cashClosing) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ NINGÚN CIERRE DE CAJA CON EL ID ${uuid}.`,
      );
    }

    const initialCash =
      dto.initialCash !== undefined
        ? this.roundMoney(Number(dto.initialCash || 0))
        : Number(cashClosing.initialCash || 0);

    const cashSales =
      dto.cashSales !== undefined
        ? this.roundMoney(Number(dto.cashSales || 0))
        : Number(cashClosing.cashSales || 0);

    const cashOrderPayments =
      dto.cashOrderPayments !== undefined
        ? this.roundMoney(Number(dto.cashOrderPayments || 0))
        : Number(cashClosing.cashOrderPayments || 0);

    const cashExpenses =
      dto.cashExpenses !== undefined
        ? this.roundMoney(Number(dto.cashExpenses || 0))
        : Number(cashClosing.cashExpenses || 0);

    const cashDeposits =
      dto.cashDeposits !== undefined
        ? this.roundMoney(Number(dto.cashDeposits || 0))
        : Number(cashClosing.cashDeposits || 0);

    const cashWithdrawals =
      dto.cashWithdrawals !== undefined
        ? this.roundMoney(Number(dto.cashWithdrawals || 0))
        : Number(cashClosing.cashWithdrawals || 0);

    const countedCash =
      dto.countedCash !== undefined
        ? this.roundMoney(Number(dto.countedCash || 0))
        : Number(cashClosing.countedCash || 0);

    const expectedCash = this.calculateExpectedCash({
      initialCash,
      cashSales,
      cashOrderPayments,
      cashExpenses,
      cashDeposits,
      cashWithdrawals,
    });

    const difference = this.roundMoney(countedCash - expectedCash);

    const dataToUpdate: Partial<CashClosing> = {
      initialCash,
      cashSales,
      cashOrderPayments,
      cashExpenses,
      cashDeposits,
      cashWithdrawals,
      expectedCash,
      countedCash,
      difference,
    };

    if (dto.closingDate !== undefined) {
      dataToUpdate.closingDate = this.parseDateOnly(dto.closingDate);
    }

    if (dto.responsibleName !== undefined) {
      dataToUpdate.responsibleName = dto.responsibleName?.trim() || null;
    }

    if (dto.notes !== undefined) {
      dataToUpdate.notes = dto.notes?.trim() || null;
    }

    try {
      return await this.cashClosingsRepository.updateRepository(
        cashClosing,
        dataToUpdate,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'OCURRIÓ UN ERROR AL ACTUALIZAR EL CIERRE DE CAJA.';

      throw new BadRequestException(message);
    }
  }

  async delete(uuid: string): Promise<{ message: string }> {
    const cashClosing =
      await this.cashClosingsRepository.findByIdRepository(uuid);

    if (!cashClosing) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ UN CIERRE DE CAJA ACTIVO CON EL ID ${uuid}.`,
      );
    }

    return this.cashClosingsRepository.deleteRepository(cashClosing);
  }

  private calculateExpectedCash(data: {
    initialCash: number;
    cashSales: number;
    cashOrderPayments: number;
    cashExpenses: number;
    cashDeposits: number;
    cashWithdrawals: number;
  }) {
    return this.roundMoney(
      data.initialCash +
        data.cashSales +
        data.cashOrderPayments -
        data.cashExpenses -
        data.cashDeposits -
        data.cashWithdrawals,
    );
  }

  private roundMoney(value: number) {
    return Number(Number(value || 0).toFixed(2));
  }

  private parseDateOnly(value: string | Date) {
    if (value instanceof Date) {
      return this.clearTime(value);
    }

    const [year, month, day] = String(value)
      .split('T')[0]
      .split('-')
      .map(Number);

    return new Date(year, month - 1, day);
  }

  private clearTime(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}