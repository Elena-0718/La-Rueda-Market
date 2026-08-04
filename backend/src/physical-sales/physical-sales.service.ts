import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PhysicalSale } from '../entities/physical-sale.entity';
import { PhysicalSaleDetail } from '../entities/physical-sale-detail.entity';
import { Product } from '../entities/product.entity';
import {
  InventoryMovementReason,
  InventoryMovementType,
} from '../entities/inventory-movement.entity';

import { PhysicalSalesRepository } from './physical-sales.repository';
import { CreatePhysicalSaleDto } from './dtos/create-physical-sale.dto';
import { UpdatePhysicalSaleDto } from './dtos/update-physical-sale.dto';

@Injectable()
export class PhysicalSalesService {
  constructor(
    private readonly physicalSalesRepository: PhysicalSalesRepository,
  ) {}

  async findAllActive(
    startDate?: string,
    endDate?: string,
  ): Promise<PhysicalSale[]> {
    if (startDate && endDate) {
      return this.physicalSalesRepository.findAllActiveByDateRangeRepository(
        startDate,
        endDate,
      );
    }

    return this.physicalSalesRepository.findAllActiveRepository();
  }

  async findAll(): Promise<PhysicalSale[]> {
    return this.physicalSalesRepository.findAllRepository();
  }

  async findOne(uuid: string): Promise<PhysicalSale> {
    const physicalSale =
      await this.physicalSalesRepository.findByIdRepository(uuid);

    if (!physicalSale) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ UNA VENTA FÍSICA ACTIVA CON EL ID ${uuid}.`,
      );
    }

    return physicalSale;
  }

  async getSummary(startDate?: string, endDate?: string) {
    const sales = await this.findAllActive(startDate, endDate);

    const totalPhysicalSales = sales.reduce(
      (total, sale) => total + Number(sale.total || 0),
      0,
    );

    const byPaymentMethod = sales.reduce(
      (accumulator: Record<string, number>, sale) => {
        const paymentMethod = sale.paymentMethod;

        accumulator[paymentMethod] =
          (accumulator[paymentMethod] || 0) + Number(sale.total || 0);

        return accumulator;
      },
      {},
    );

    return {
      totalPhysicalSales,
      totalRecords: sales.length,
      byPaymentMethod,
    };
  }

  async create(dto: CreatePhysicalSaleDto): Promise<PhysicalSale> {
    try {
      const physicalSale =
        this.physicalSalesRepository.createPhysicalSaleRepository({
          saleDate: this.parseDateOnly(dto.saleDate),
          paymentMethod: dto.paymentMethod,
          subtotal: 0,
          total: 0,
          notes: dto.notes?.trim() || null,
          isActive: true,
        });

      const details: PhysicalSaleDetail[] = [];
      let saleTotal = 0;

      for (const detailDto of dto.details) {
        const product =
          await this.physicalSalesRepository.findProductByUuidRepository(
            detailDto.productUuid,
          );

        if (!product) {
          throw new NotFoundException(
            `EL PRODUCTO CON ID ${detailDto.productUuid} NO EXISTE O ESTÁ INACTIVO.`,
          );
        }

        const quantity = Number(detailDto.quantity);
        const unitPrice =
          detailDto.unitPrice !== undefined && detailDto.unitPrice !== null
            ? this.roundMoney(Number(detailDto.unitPrice))
            : this.roundMoney(Number(product.price || 0));

        if (unitPrice <= 0) {
          throw new BadRequestException(
            `EL PRODUCTO "${product.name}" NO TIENE UN PRECIO DE VENTA VÁLIDO.`,
          );
        }

        const lineTotal = this.roundMoney(quantity * unitPrice);

        await this.registerInventoryOutput({
          product,
          quantity,
          unitPrice,
          notes: dto.notes,
        });

        const detail =
          this.physicalSalesRepository.createPhysicalSaleDetailRepository({
            physicalSale,
            product,
            quantity,
            unitPrice,
            lineTotal,
          });

        details.push(detail);
        saleTotal += lineTotal;
      }

      physicalSale.subtotal = this.roundMoney(saleTotal);
      physicalSale.total = this.roundMoney(saleTotal);
      physicalSale.details = details;

      return await this.physicalSalesRepository.savePhysicalSaleRepository(
        physicalSale,
      );
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
          : 'OCURRIÓ UN ERROR AL CREAR LA VENTA FÍSICA.';

      throw new BadRequestException(message);
    }
  }

  async update(
    uuid: string,
    dto: UpdatePhysicalSaleDto,
  ): Promise<PhysicalSale> {
    const physicalSale =
      await this.physicalSalesRepository.findByIdIncludingInactiveRepository(
        uuid,
      );

    if (!physicalSale) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ NINGUNA VENTA FÍSICA CON EL ID ${uuid}.`,
      );
    }

    const dataToUpdate: Partial<PhysicalSale> = {};

    if (dto.saleDate !== undefined) {
      dataToUpdate.saleDate = this.parseDateOnly(dto.saleDate);
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
      return await this.physicalSalesRepository.updatePhysicalSaleRepository(
        physicalSale,
        dataToUpdate,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'OCURRIÓ UN ERROR AL ACTUALIZAR LA VENTA FÍSICA.';

      throw new BadRequestException(message);
    }
  }

  async delete(uuid: string): Promise<{ message: string }> {
    const physicalSale =
      await this.physicalSalesRepository.findByIdRepository(uuid);

    if (!physicalSale) {
      throw new NotFoundException(
        `NO SE ENCONTRÓ UNA VENTA FÍSICA ACTIVA CON EL ID ${uuid}.`,
      );
    }

    try {
      return await this.physicalSalesRepository.deletePhysicalSaleRepository(
        physicalSale,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'OCURRIÓ UN ERROR AL ELIMINAR LA VENTA FÍSICA.';

      throw new BadRequestException(message);
    }
  }

  private async registerInventoryOutput(data: {
    product: Product;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }) {
    const inventory =
      await this.physicalSalesRepository.findInventoryByProductUuidRepository(
        data.product.uuid,
      );

    if (!inventory) {
      throw new BadRequestException(
        `EL PRODUCTO "${data.product.name}" NO TIENE INVENTARIO CREADO. PARA VENDERLO EN EL LOCAL, PRIMERO DEBE ESTAR CONTROLADO EN INVENTARIO.`,
      );
    }

    if (!inventory.isTracked) {
      throw new BadRequestException(
        `EL PRODUCTO "${data.product.name}" NO ESTÁ MARCADO PARA CONTROL DE INVENTARIO.`,
      );
    }

    const previousStock = Number(inventory.currentStock || 0);

    if (data.quantity > previousStock) {
      throw new BadRequestException(
        `NO HAY STOCK SUFICIENTE PARA "${data.product.name}". STOCK ACTUAL: ${previousStock}.`,
      );
    }

    const newStock = this.roundQuantity(previousStock - data.quantity);

    const movement =
      this.physicalSalesRepository.createInventoryMovementRepository({
        inventory,
        movementType: InventoryMovementType.OUT,
        reason: InventoryMovementReason.STORE_SALE,
        quantity: data.quantity,
        previousStock,
        newStock,
        purchasePrice: inventory.lastPurchasePrice ?? null,
        supplierName: inventory.supplierName ?? null,
        expirationDate: inventory.expirationDate ?? null,
        orderUuid: null,
        notes:
          data.notes?.trim() ||
          `Salida automática por venta física de ${data.product.name}.`,
      });

    inventory.currentStock = newStock;

    await this.physicalSalesRepository.saveInventoryRepository(inventory);
    await this.physicalSalesRepository.saveInventoryMovementRepository(
      movement,
    );
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