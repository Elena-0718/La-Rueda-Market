import { Injectable } from '@nestjs/common';

import { FinancialReportRepository } from './financial-report.repository';
import { PurchaseType } from '../entities/purchase.entity';

@Injectable()
export class FinancialReportService {
  constructor(
    private readonly financialReportRepository: FinancialReportRepository,
  ) {}

  async getSummary(startDate?: string, endDate?: string) {
    const [
      deliveredOrders,
      physicalSales,
      purchases,
      expenses,
    ] = await Promise.all([
      this.financialReportRepository.findDeliveredOrdersRepository(
        startDate,
        endDate,
      ),
      this.financialReportRepository.findPhysicalSalesRepository(
        startDate,
        endDate,
      ),
      this.financialReportRepository.findPurchasesRepository(
        startDate,
        endDate,
      ),
      this.financialReportRepository.findExpensesRepository(
        startDate,
        endDate,
      ),
    ]);

    const scheduledOrderIncome = this.sumByField(
      deliveredOrders,
      'total',
    );

    const physicalSalesIncome = this.sumByField(
      physicalSales,
      'total',
    );

    const grossIncome = this.roundMoney(
      scheduledOrderIncome + physicalSalesIncome,
    );

    const productCosts = this.sumByField(
      purchases,
      'total',
    );

    const operatingExpenses = this.sumByField(
      expenses,
      'amount',
    );

    const estimatedNetProfit = this.roundMoney(
      grossIncome - productCosts - operatingExpenses,
    );

    const inventoryPurchases = purchases
      .filter(
        (purchase) => purchase.purchaseType === PurchaseType.INVENTORY,
      )
      .reduce(
        (total, purchase) => total + Number(purchase.total || 0),
        0,
      );

    const scheduledOrderPurchases = purchases
      .filter(
        (purchase) =>
          purchase.purchaseType === PurchaseType.SCHEDULED_ORDER,
      )
      .reduce(
        (total, purchase) => total + Number(purchase.total || 0),
        0,
      );

    return {
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      incomes: {
        scheduledOrderIncome,
        physicalSalesIncome,
        grossIncome,
        deliveredOrdersCount: deliveredOrders.length,
        physicalSalesCount: physicalSales.length,
      },
      costs: {
        productCosts,
        inventoryPurchases: this.roundMoney(inventoryPurchases),
        scheduledOrderPurchases: this.roundMoney(
          scheduledOrderPurchases,
        ),
        purchasesCount: purchases.length,
      },
      expenses: {
        operatingExpenses,
        expensesCount: expenses.length,
      },
      result: {
        estimatedNetProfit,
        profitMarginPercentage:
          grossIncome > 0
            ? this.roundMoney((estimatedNetProfit / grossIncome) * 100)
            : 0,
      },
    };
  }

  async getDetailedReport(startDate?: string, endDate?: string) {
    const summary = await this.getSummary(startDate, endDate);

    const [
      deliveredOrders,
      physicalSales,
      purchases,
      expenses,
    ] = await Promise.all([
      this.financialReportRepository.findDeliveredOrdersRepository(
        startDate,
        endDate,
      ),
      this.financialReportRepository.findPhysicalSalesRepository(
        startDate,
        endDate,
      ),
      this.financialReportRepository.findPurchasesRepository(
        startDate,
        endDate,
      ),
      this.financialReportRepository.findExpensesRepository(
        startDate,
        endDate,
      ),
    ]);

    return {
      summary,
      details: {
        deliveredOrders,
        physicalSales,
        purchases,
        expenses,
      },
    };
  }

  private sumByField<T extends Record<string, any>>(
    records: T[],
    field: string,
  ) {
    return this.roundMoney(
      records.reduce(
        (total, record) => total + Number(record[field] || 0),
        0,
      ),
    );
  }

  private roundMoney(value: number) {
    return Number(Number(value || 0).toFixed(2));
  }
}