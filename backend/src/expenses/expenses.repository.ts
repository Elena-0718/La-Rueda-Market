import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Expense } from '../entities/expense.entity';

@Injectable()
export class ExpensesRepository {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesDB: Repository<Expense>,
  ) {}

  async findAllActiveRepository(): Promise<Expense[]> {
    return this.expensesDB.find({
      where: { isActive: true },
      order: {
        expenseDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findAllRepository(): Promise<Expense[]> {
    return this.expensesDB.find({
      order: {
        expenseDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findAllActiveByDateRangeRepository(
    startDate: string,
    endDate: string,
  ): Promise<Expense[]> {
    return this.expensesDB.find({
      where: {
        isActive: true,
        expenseDate: Between(
          new Date(`${startDate}T00:00:00`),
          new Date(`${endDate}T23:59:59`),
        ),
      },
      order: {
        expenseDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findByIdRepository(uuid: string): Promise<Expense | null> {
    return this.expensesDB.findOne({
      where: {
        uuid,
        isActive: true,
      },
    });
  }

  async findByIdIncludingInactiveRepository(
    uuid: string,
  ): Promise<Expense | null> {
    return this.expensesDB.findOne({
      where: { uuid },
    });
  }

  async createExpenseRepository(
    data: Partial<Expense>,
  ): Promise<Expense> {
    const expense = this.expensesDB.create(data);
    return this.expensesDB.save(expense);
  }

  async updateExpenseRepository(
    expense: Expense,
    data: Partial<Expense>,
  ): Promise<Expense> {
    Object.assign(expense, data);
    return this.expensesDB.save(expense);
  }

  async deleteExpenseRepository(
    expense: Expense,
  ): Promise<{ message: string }> {
    expense.isActive = false;

    await this.expensesDB.save(expense);

    return {
      message: `El gasto "${expense.description}" fue desactivado correctamente.`,
    };
  }
}