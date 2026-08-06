import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CashDeposit } from '../entities/cash-deposit.entity';
import { CashDepositsRepository } from './cash-deposits.repository';
import { CreateCashDepositDto } from './dtos/create-cash-deposit.dto';
import { UpdateCashDepositDto } from './dtos/update-cash-deposit.dto';

@Injectable()
export class CashDepositsService {
  constructor(
    private readonly cashDepositsRepository: CashDepositsRepository,
  ) {}

  async findAllActive(
    startDate?: string,
    endDate?: string,
  ): Promise<CashDeposit[]> {
    if (startDate && endDate) {
      return this.cashDepositsRepository.findAllActiveByDateRangeRepository(
        startDate,
        endDate,
      );
    }

    return this.cashDepositsRepository.findAllActiveRepository();
  }

  async findAll(): Promise<CashDeposit[]> {
    return this.cashDepositsRepository.findAllRepository();
  }

  async findOne(uuid: string): Promise<CashDeposit> {
    const cashDeposit =
      await this.cashDepositsRepository.findByIdRepository(uuid);

    if (!cashDeposit) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ UNA CONSIGNACIÓN ACTIVA CON EL ID ${uuid}.`,
      );
    }

    return cashDeposit;
  }

  async getSummary(startDate?: string, endDate?: string) {
    const deposits = await this.findAllActive(startDate, endDate);

    const totalDeposited = deposits.reduce(
      (total, deposit) => total + Number(deposit.amount || 0),
      0,
    );

    const byDepositMethod = deposits.reduce(
      (accumulator: Record<string, number>, deposit) => {
        const method = deposit.depositMethod;

        accumulator[method] =
          (accumulator[method] || 0) + Number(deposit.amount || 0);

        return accumulator;
      },
      {},
    );

    return {
      totalRecords: deposits.length,
      totalDeposited: this.roundMoney(totalDeposited),
      byDepositMethod,
    };
  }

  async create(dto: CreateCashDepositDto): Promise<CashDeposit> {
    const amount = this.roundMoney(Number(dto.amount || 0));

    if (amount <= 0) {
      throw new BadRequestException(
        'EL VALOR DE LA CONSIGNACIÓN DEBE SER MAYOR A CERO.',
      );
    }

    const cashDeposit = this.cashDepositsRepository.createRepository({
      depositDate: this.parseDateOnly(dto.depositDate),
      amount,
      depositMethod: dto.depositMethod,
      destinationAccount: dto.destinationAccount?.trim() || null,
      receiptNumber: dto.receiptNumber?.trim() || null,
      responsibleName: dto.responsibleName?.trim() || null,
      notes: dto.notes?.trim() || null,
      isActive: true,
    });

    try {
      return await this.cashDepositsRepository.saveRepository(cashDeposit);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'OCURRIÓ UN ERROR AL REGISTRAR LA CONSIGNACIÓN.';

      throw new BadRequestException(message);
    }
  }

  async update(
    uuid: string,
    dto: UpdateCashDepositDto,
  ): Promise<CashDeposit> {
    const cashDeposit =
      await this.cashDepositsRepository.findByIdIncludingInactiveRepository(
        uuid,
      );

    if (!cashDeposit) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ NINGUNA CONSIGNACIÓN CON EL ID ${uuid}.`,
      );
    }

    const dataToUpdate: Partial<CashDeposit> = {};

    if (dto.depositDate !== undefined) {
      dataToUpdate.depositDate = this.parseDateOnly(dto.depositDate);
    }

    if (dto.amount !== undefined) {
      const amount = this.roundMoney(Number(dto.amount || 0));

      if (amount <= 0) {
        throw new BadRequestException(
          'EL VALOR DE LA CONSIGNACIÓN DEBE SER MAYOR A CERO.',
        );
      }

      dataToUpdate.amount = amount;
    }

    if (dto.depositMethod !== undefined) {
      dataToUpdate.depositMethod = dto.depositMethod;
    }

    if (dto.destinationAccount !== undefined) {
      dataToUpdate.destinationAccount =
        dto.destinationAccount?.trim() || null;
    }

    if (dto.receiptNumber !== undefined) {
      dataToUpdate.receiptNumber = dto.receiptNumber?.trim() || null;
    }

    if (dto.responsibleName !== undefined) {
      dataToUpdate.responsibleName = dto.responsibleName?.trim() || null;
    }

    if (dto.notes !== undefined) {
      dataToUpdate.notes = dto.notes?.trim() || null;
    }

    try {
      return await this.cashDepositsRepository.updateRepository(
        cashDeposit,
        dataToUpdate,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'OCURRIÓ UN ERROR AL ACTUALIZAR LA CONSIGNACIÓN.';

      throw new BadRequestException(message);
    }
  }

  async delete(uuid: string): Promise<{ message: string }> {
    const cashDeposit =
      await this.cashDepositsRepository.findByIdRepository(uuid);

    if (!cashDeposit) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ UNA CONSIGNACIÓN ACTIVA CON EL ID ${uuid}.`,
      );
    }

    return this.cashDepositsRepository.deleteRepository(cashDeposit);
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