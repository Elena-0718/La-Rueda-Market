import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Order, OrderStatus } from '../entities/order.entity';
import { PhysicalSale } from '../entities/physical-sale.entity';
import { Purchase } from '../entities/purchase.entity';
import { Expense } from '../entities/expense.entity';

@Injectable()
export class FinancialReportRepository {
  constructor(
    @InjectRepository(Order)
    private readonly ordersDB: Repository<Order>,

    @InjectRepository(PhysicalSale)
    private readonly physicalSalesDB: Repository<PhysicalSale>,

    @InjectRepository(Purchase)
    private readonly purchasesDB: Repository<Purchase>,

    @InjectRepository(Expense)
    private readonly expensesDB: Repository<Expense>,
  ) {}

  findDeliveredOrdersRepository(
    startDate?: string,
    endDate?: string,
  ): Promise<Order[]> {
    const where: any = {
      status: OrderStatus.DELIVERED,
    };

    if (startDate && endDate) {
      where.createdAt = Between(
        new Date(`${startDate}T00:00:00`),
        new Date(`${endDate}T23:59:59`),
      );
    }

    return this.ordersDB.find({
      where,
      relations: [
        'user',
        'payment',
        'delivery',
        'orderDetails',
        'orderDetails.product',
        'orderDetails.product.category',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findPhysicalSalesRepository(
    startDate?: string,
    endDate?: string,
  ): Promise<PhysicalSale[]> {
    const where: any = {
      isActive: true,
    };

    if (startDate && endDate) {
      where.saleDate = Between(
        new Date(`${startDate}T00:00:00`),
        new Date(`${endDate}T23:59:59`),
      );
    }

    return this.physicalSalesDB.find({
      where,
      relations: {
        details: {
          product: {
            category: true,
          },
        },
      },
      order: {
        saleDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  findPurchasesRepository(
    startDate?: string,
    endDate?: string,
  ): Promise<Purchase[]> {
    const where: any = {
      isActive: true,
    };

    if (startDate && endDate) {
      where.purchaseDate = Between(
        new Date(`${startDate}T00:00:00`),
        new Date(`${endDate}T23:59:59`),
      );
    }

    return this.purchasesDB.find({
      where,
      relations: {
        details: {
          product: {
            category: true,
          },
        },
      },
      order: {
        purchaseDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  findExpensesRepository(
    startDate?: string,
    endDate?: string,
  ): Promise<Expense[]> {
    const where: any = {
      isActive: true,
    };

    if (startDate && endDate) {
      where.expenseDate = Between(
        new Date(`${startDate}T00:00:00`),
        new Date(`${endDate}T23:59:59`),
      );
    }

    return this.expensesDB.find({
      where,
      order: {
        expenseDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }
}