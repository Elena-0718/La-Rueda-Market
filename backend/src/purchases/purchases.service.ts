import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Purchase, PurchaseType } from '../entities/purchase.entity';
import { PurchaseDetail } from '../entities/purchase-detail.entity';
import { Product } from '../entities/product.entity';
import {
  InventoryMovementReason,
  InventoryMovementType,
} from '../entities/inventory-movement.entity';

import { CreatePurchaseDto } from './dtos/create-purchase.dto';
import { PurchasesRepository } from './purchases.repository';
import { UpdatePurchaseDto } from './dtos/update-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly purchasesRepository: PurchasesRepository,
  ) {}

  async findAllActive(
    startDate?: string,
    endDate?: string,
  ): Promise<Purchase[]> {
    if (startDate && endDate) {
      return this.purchasesRepository.findAllActiveByDateRangeRepository(
        startDate,
        endDate,
      );
    }

    return this.purchasesRepository.findAllActiveRepository();
  }

  async findAll(): Promise<Purchase[]> {
    return this.purchasesRepository.findAllRepository();
  }

  async findOne(uuid: string): Promise<Purchase> {
    const purchase =
      await this.purchasesRepository.findByIdRepository(uuid);

    if (!purchase) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ UNA COMPRA ACTIVA CON EL ID ${uuid}.`,
      );
    }

    return purchase;
  }

  async getSummary(startDate?: string, endDate?: string) {
    const purchases = await this.findAllActive(startDate, endDate);

    const totalPurchases = purchases.reduce(
      (total, purchase) => total + Number(purchase.total || 0),
      0,
    );

    const inventoryPurchases = purchases
      .filter((purchase) => purchase.purchaseType === PurchaseType.INVENTORY)
      .reduce((total, purchase) => total + Number(purchase.total || 0), 0);

    const scheduledOrderPurchases = purchases
      .filter(
        (purchase) =>
          purchase.purchaseType === PurchaseType.SCHEDULED_ORDER,
      )
      .reduce((total, purchase) => total + Number(purchase.total || 0), 0);

    return {
      totalPurchases,
      inventoryPurchases,
      scheduledOrderPurchases,
      totalRecords: purchases.length,
    };
  }

  async create(dto: CreatePurchaseDto): Promise<Purchase> {
    try {
      const purchase = this.purchasesRepository.createPurchaseRepository({
        purchaseDate: this.parseDateOnly(dto.purchaseDate),
        supplierName: dto.supplierName?.trim() || null,
        purchaseType: dto.purchaseType,
        relatedOrderUuid: dto.relatedOrderUuid?.trim() || null,
        notes: dto.notes?.trim() || null,
        total: 0,
        isActive: true,
      });

      const details: PurchaseDetail[] = [];
      let purchaseTotal = 0;

      for (const detailDto of dto.details) {
        const product =
          await this.purchasesRepository.findProductByUuidRepository(
            detailDto.productUuid,
          );

        if (!product) {
          throw new NotFoundException(
            `EL PRODUCTO CON ID ${detailDto.productUuid} NO EXISTE.`,
          );
        }

        const quantity = Number(detailDto.quantity);
        const unitCost = Number(detailDto.unitCost);
        const profitPercentage = Number(detailDto.profitPercentage || 0);

        const suggestedSalePrice = this.calculateSuggestedSalePrice(
          unitCost,
          profitPercentage,
        );

        const manualSalePrice =
          detailDto.manualSalePrice !== undefined &&
          detailDto.manualSalePrice !== null
            ? this.roundMoney(Number(detailDto.manualSalePrice))
            : null;

        const finalSalePrice =
          manualSalePrice !== null ? manualSalePrice : suggestedSalePrice;

        const lineTotal = this.roundMoney(quantity * unitCost);

        if (detailDto.updateProductPrice === true) {
          await this.updateProductPrice(product, finalSalePrice);
        }

        if (dto.purchaseType === PurchaseType.INVENTORY) {
          await this.registerInventoryEntry({
            product,
            quantity,
            unitCost,
            supplierName: dto.supplierName,
            purchaseDate: dto.purchaseDate,
            notes: dto.notes,
          });
        }

        const detail = this.purchasesRepository.createPurchaseDetailRepository({
          purchase,
          product,
          quantity,
          unitCost,
          profitPercentage,
          suggestedSalePrice,
          manualSalePrice,
          finalSalePrice,
          updateProductPrice: detailDto.updateProductPrice ?? false,
          lineTotal,
        });

        details.push(detail);
        purchaseTotal += lineTotal;
      }

      purchase.total = this.roundMoney(purchaseTotal);
      purchase.details = details;

      return await this.purchasesRepository.savePurchaseRepository(purchase);
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      const message =
        error instanceof Error
          ? error.message
          : 'OCURRIÓ UN ERROR AL CREAR LA COMPRA.';

      throw new BadRequestException(message);
    }
  }

  async update(
    uuid: string,
    dto: UpdatePurchaseDto,
  ): Promise<Purchase> {
    const purchase =
      await this.purchasesRepository.findByIdIncludingInactiveRepository(
        uuid,
      );

    if (!purchase) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ NINGUNA COMPRA CON EL ID ${uuid}.`,
      );
    }

    const dataToUpdate: Partial<Purchase> = {};

    if (dto.purchaseDate !== undefined) {
      dataToUpdate.purchaseDate = this.parseDateOnly(dto.purchaseDate);
    }

    if (dto.supplierName !== undefined) {
      dataToUpdate.supplierName = dto.supplierName?.trim() || null;
    }

    if (dto.purchaseType !== undefined) {
      dataToUpdate.purchaseType = dto.purchaseType;
    }

    if (dto.notes !== undefined) {
      dataToUpdate.notes = dto.notes?.trim() || null;
    }

    if (dto.isActive !== undefined) {
      dataToUpdate.isActive = dto.isActive;
    }

    try {
      return await this.purchasesRepository.updatePurchaseRepository(
        purchase,
        dataToUpdate,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'OCURRIÓ UN ERROR AL ACTUALIZAR LA COMPRA.';

      throw new BadRequestException(message);
    }
  }

  async delete(uuid: string): Promise<{ message: string }> {
    const purchase =
      await this.purchasesRepository.findByIdRepository(uuid);

    if (!purchase) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ UNA COMPRA ACTIVA CON EL ID ${uuid}.`,
      );
    }

    try {
      return await this.purchasesRepository.deletePurchaseRepository(
        purchase,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'OCURRIÓ UN ERROR AL ELIMINAR LA COMPRA.';

      throw new BadRequestException(message);
    }
  }

  private async updateProductPrice(
    product: Product,
    finalSalePrice: number,
  ) {
    product.price = finalSalePrice;

    await this.purchasesRepository.saveProductRepository(product);
  }

  private async registerInventoryEntry(data: {
    product: Product;
    quantity: number;
    unitCost: number;
    supplierName?: string;
    purchaseDate: string;
    notes?: string;
  }) {
    const inventory =
      await this.purchasesRepository.findInventoryByProductUuidRepository(
        data.product.uuid,
      );

    if (!inventory) {
      throw new BadRequestException(
        `EL PRODUCTO "${data.product.name}" NO TIENE INVENTARIO CREADO. PRIMERO CREA EL REGISTRO EN INVENTARIO O USA TIPO DE COMPRA PEDIDO PROGRAMADO.`,
      );
    }

    if (!inventory.isTracked) {
      throw new BadRequestException(
        `EL PRODUCTO "${data.product.name}" NO ESTÁ MARCADO PARA CONTROL DE INVENTARIO.`,
      );
    }

    const previousStock = Number(inventory.currentStock || 0);
    const newStock = this.roundQuantity(previousStock + data.quantity);

    const movement =
      this.purchasesRepository.createInventoryMovementRepository({
        inventory,
        movementType: InventoryMovementType.IN,
        reason: InventoryMovementReason.SUPPLIER_PURCHASE,
        quantity: data.quantity,
        previousStock,
        newStock,
        purchasePrice: data.unitCost,
        supplierName: data.supplierName?.trim() || null,
        expirationDate: null,
        orderUuid: null,
        notes:
          data.notes?.trim() ||
          `Entrada automática por compra registrada para ${data.product.name}.`,
      });

    inventory.currentStock = newStock;
    inventory.lastPurchasePrice = data.unitCost;

    if (data.supplierName !== undefined) {
      inventory.supplierName = data.supplierName?.trim() || null;
    }

    await this.purchasesRepository.saveInventoryRepository(inventory);
    await this.purchasesRepository.saveInventoryMovementRepository(movement);
  }

  private calculateSuggestedSalePrice(
    unitCost: number,
    profitPercentage: number,
  ) {
    const salePrice = unitCost * (1 + profitPercentage / 100);

    return this.roundToNearestHundred(salePrice);
  }

  private roundToNearestHundred(value: number) {
    return Math.round(Number(value || 0) / 100) * 100;
  }

  private roundMoney(value: number) {
    return Number(Number(value || 0).toFixed(2));
  }

  private roundQuantity(value: number) {
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