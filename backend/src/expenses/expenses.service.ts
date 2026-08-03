import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Expense } from '../entities/expense.entity';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { UpdateExpenseDto } from './dtos/update-expense.dto';
import { ExpensesRepository } from './expenses.repository';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly expensesRepository: ExpensesRepository,
  ) {}

  async findAllActive(
    startDate?: string,
    endDate?: string,
  ): Promise<Expense[]> {
    if (startDate && endDate) {
      return this.expensesRepository.findAllActiveByDateRangeRepository(
        startDate,
        endDate,
      );
    }

    return this.expensesRepository.findAllActiveRepository();
  }

  async findAll(): Promise<Expense[]> {
    return this.expensesRepository.findAllRepository();
  }

  async findOne(uuid: string): Promise<Expense> {
    const expense = await this.expensesRepository.findByIdRepository(uuid);

    if (!expense) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ UN GASTO ACTIVO CON EL ID ${uuid}.`,
      );
    }

    return expense;
  }

  async getSummary(startDate?: string, endDate?: string) {
    const expenses = await this.findAllActive(startDate, endDate);

    const totalExpenses = expenses.reduce(
      (total, expense) => total + Number(expense.amount || 0),
      0,
    );

    const byCategory = expenses.reduce(
      (accumulator: Record<string, number>, expense) => {
        const category = expense.category;

        accumulator[category] =
          (accumulator[category] || 0) + Number(expense.amount || 0);

        return accumulator;
      },
      {},
    );

    return {
      totalExpenses,
      totalRecords: expenses.length,
      byCategory,
    };
  }

  async create(dto: CreateExpenseDto): Promise<Expense> {
    try {
      return await this.expensesRepository.createExpenseRepository({
        expenseDate: new Date(dto.expenseDate),
        category: dto.category,
        description: dto.description.trim(),
        amount: Number(dto.amount),
        paymentMethod: dto.paymentMethod,
        notes: dto.notes?.trim() || null,
        isActive: true,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'OCURRIÓ UN ERROR AL CREAR EL GASTO.';

      throw new BadRequestException(message);
    }
  }

  async update(
    uuid: string,
    dto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense =
      await this.expensesRepository.findByIdIncludingInactiveRepository(uuid);

    if (!expense) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ NINGÚN GASTO CON EL ID ${uuid}.`,
      );
    }

    const dataToUpdate: Partial<Expense> = {};

    if (dto.expenseDate !== undefined) {
      dataToUpdate.expenseDate = new Date(dto.expenseDate);
    }

    if (dto.category !== undefined) {
      dataToUpdate.category = dto.category;
    }

    if (dto.description !== undefined) {
      dataToUpdate.description = dto.description.trim();
    }

    if (dto.amount !== undefined) {
      dataToUpdate.amount = Number(dto.amount);
    }

    if (dto.paymentMethod !== undefined) {
      dataToUpdate.paymentMethod = dto.paymentMethod;
    }

    if (dto.notes !== undefined) {
      dataToUpdate.notes = dto.notes?.trim() || null;
    }

    if (dto.isActive !== undefined) {
      dataToUpdate.isActive = dto.isActive;
    }

    try {
      return await this.expensesRepository.updateExpenseRepository(
        expense,
        dataToUpdate,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'OCURRIÓ UN ERROR AL ACTUALIZAR EL GASTO.';

      throw new BadRequestException(message);
    }
  }

  async delete(uuid: string): Promise<{ message: string }> {
    const expense = await this.expensesRepository.findByIdRepository(uuid);

    if (!expense) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ UN GASTO ACTIVO CON EL ID ${uuid}.`,
      );
    }

    try {
      return await this.expensesRepository.deleteExpenseRepository(expense);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'OCURRIÓ UN ERROR AL ELIMINAR EL GASTO.';

      throw new BadRequestException(message);
    }
  }
}