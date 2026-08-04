import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PhysicalSale } from '../entities/physical-sale.entity';
import { PhysicalSaleDetail } from '../entities/physical-sale-detail.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/users.entity';
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
      let customerUser: User | null = null;

      if (dto.customerUserUuid) {
        customerUser =
          await this.physicalSalesRepository.findUserByUuidRepository(
            dto.customerUserUuid,
          );

        if (!customerUser) {
          throw new NotFoundException(
            `NO SE ENCONTRÓ UN CLIENTE CON EL ID ${dto.customerUserUuid}.`,
          );
        }
      }

      const physicalSale =
        this.physicalSalesRepository.createPhysicalSaleRepository({
          saleDate: this.parseDateOnly(dto.saleDate),
          customerName: dto.customerName?.trim() || 'Cliente local',
          customerUser,
          paymentMethod: dto.paymentMethod,
          subtotal: 0,
          total: 0,
          notes: dto.notes?.trim() || null,
          isActive: true,
        });

      const savedPhysicalSale =
        await this.physicalSalesRepository.savePhysicalSaleRepository(
          physicalSale,
        );

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

        if (!quantity || quantity <= 0) {
          throw new BadRequestException(
            `LA CANTIDAD DE "${product.name}" DEBE SER MAYOR A CERO.`,
          );
        }

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
            physicalSale: savedPhysicalSale,
            product,
            quantity,
            unitPrice,
            lineTotal,
          });

        details.push(detail);
        saleTotal += lineTotal;
      }

      savedPhysicalSale.subtotal = this.roundMoney(saleTotal);
      savedPhysicalSale.total = this.roundMoney(saleTotal);
      savedPhysicalSale.details = details;

      return await this.physicalSalesRepository.savePhysicalSaleRepository(
        savedPhysicalSale,
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
      await this.reversePhysicalSaleInventory(physicalSale);

      await this.physicalSalesRepository.deletePhysicalSaleRepository(
        physicalSale,
      );

      return {
        message:
          'La venta física fue anulada correctamente y el inventario fue devuelto.',
      };
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
          : 'OCURRIÓ UN ERROR AL ANULAR LA VENTA FÍSICA.';

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

  private async reversePhysicalSaleInventory(physicalSale: PhysicalSale) {
    if (!physicalSale.details || physicalSale.details.length === 0) {
      throw new BadRequestException(
        'NO SE PUEDE ANULAR LA VENTA FÍSICA PORQUE NO TIENE DETALLES DE PRODUCTOS.',
      );
    }

    for (const detail of physicalSale.details) {
      const product = detail.product;

      if (!product) {
        throw new BadRequestException(
          'NO SE PUEDE ANULAR LA VENTA FÍSICA PORQUE UNO DE SUS DETALLES NO TIENE PRODUCTO ASOCIADO.',
        );
      }

      const inventory =
        await this.physicalSalesRepository.findInventoryByProductUuidRepository(
          product.uuid,
        );

      if (!inventory) {
        throw new BadRequestException(
          `NO SE PUEDE ANULAR LA VENTA FÍSICA. EL PRODUCTO "${product.name}" NO TIENE INVENTARIO CREADO.`,
        );
      }

      if (!inventory.isTracked) {
        throw new BadRequestException(
          `NO SE PUEDE ANULAR LA VENTA FÍSICA. EL PRODUCTO "${product.name}" NO ESTÁ CONTROLADO EN INVENTARIO.`,
        );
      }

      const quantityToReturn = Number(detail.quantity || 0);

      if (quantityToReturn <= 0) {
        throw new BadRequestException(
          `LA CANTIDAD A DEVOLVER DEL PRODUCTO "${product.name}" NO ES VÁLIDA.`,
        );
      }
    }

    for (const detail of physicalSale.details) {
      const product = detail.product;
      const inventory =
        await this.physicalSalesRepository.findInventoryByProductUuidRepository(
          product.uuid,
        );

      if (!inventory) {
        throw new BadRequestException(
          `NO SE ENCONTRÓ INVENTARIO PARA "${product.name}".`,
        );
      }

      const quantityToReturn = Number(detail.quantity || 0);
      const previousStock = Number(inventory.currentStock || 0);
      const newStock = this.roundQuantity(previousStock + quantityToReturn);

      const movement =
        this.physicalSalesRepository.createInventoryMovementRepository({
          inventory,
          movementType: InventoryMovementType.IN,
          reason: InventoryMovementReason.RETURN,
          quantity: quantityToReturn,
          previousStock,
          newStock,
          purchasePrice: inventory.lastPurchasePrice ?? null,
          supplierName: inventory.supplierName ?? null,
          expirationDate: inventory.expirationDate ?? null,
          orderUuid: null,
          notes: `Reversión automática por anulación de venta física ${physicalSale.uuid}. Producto: ${product.name}. Cantidad devuelta: ${quantityToReturn}.`,
        });

      inventory.currentStock = newStock;

      await this.physicalSalesRepository.saveInventoryRepository(inventory);
      await this.physicalSalesRepository.saveInventoryMovementRepository(
        movement,
      );
    }
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