import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateInventoryDto } from './dtos/create-inventory.dto';
import { UpdateInventoryDto } from './dtos/update-inventory.dto';
import { CreateInventoryMovementDto } from './dtos/create-inventory-movement.dto';
import { InventoryRepository } from './inventory.repository';
import {
  InventoryMovementReason,
  InventoryMovementType,
} from '../entities/inventory-movement.entity';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async createInventoryService(createInventoryDto: CreateInventoryDto) {
    const product = await this.inventoryRepository.findProductByUuid(
      createInventoryDto.productUuid,
    );

    if (!product) {
      throw new NotFoundException('EL PRODUCTO NO EXISTE.');
    }

    const existingInventory =
      await this.inventoryRepository.findInventoryByProductUuid(
        createInventoryDto.productUuid,
      );

    if (existingInventory) {
      throw new BadRequestException(
        'ESTE PRODUCTO YA TIENE UN REGISTRO DE INVENTARIO.',
      );
    }

    const inventory = this.inventoryRepository.createInventory({
      product,
      currentStock: createInventoryDto.currentStock ?? 0,
      minimumStock: createInventoryDto.minimumStock ?? 0,
      isTracked: createInventoryDto.isTracked ?? true,
      isPerishable: createInventoryDto.isPerishable ?? false,
      expirationDate: createInventoryDto.expirationDate
        ? new Date(createInventoryDto.expirationDate)
        : null,
      expirationAlertDays: createInventoryDto.expirationAlertDays ?? 7,
      supplierName: createInventoryDto.supplierName?.trim() || null,
      lastPurchasePrice: createInventoryDto.lastPurchasePrice ?? null,
      notes: createInventoryDto.notes?.trim() || null,
    });

    const savedInventory =
      await this.inventoryRepository.saveInventory(inventory);

    return this.buildInventoryResponse(savedInventory);
  }

  async getAllInventoriesService() {
    const inventories = await this.inventoryRepository.findAllInventories();

    return inventories.map((inventory) =>
      this.buildInventoryResponse(inventory),
    );
  }

  async getInventoryByUuidService(uuid: string) {
    const inventory = await this.inventoryRepository.findInventoryByUuid(uuid);

    if (!inventory) {
      throw new NotFoundException('EL INVENTARIO NO EXISTE.');
    }

    return this.buildInventoryResponse(inventory);
  }

  async updateInventoryService(
    uuid: string,
    updateInventoryDto: UpdateInventoryDto,
  ) {
    const inventory = await this.inventoryRepository.findInventoryByUuid(uuid);

    if (!inventory) {
      throw new NotFoundException('EL INVENTARIO NO EXISTE.');
    }

    if (updateInventoryDto.productUuid) {
      const product = await this.inventoryRepository.findProductByUuid(
        updateInventoryDto.productUuid,
      );

      if (!product) {
        throw new NotFoundException('EL PRODUCTO NO EXISTE.');
      }

      const existingInventory =
        await this.inventoryRepository.findInventoryByProductUuid(
          updateInventoryDto.productUuid,
        );

      if (existingInventory && existingInventory.uuid !== uuid) {
        throw new BadRequestException(
          'ESTE PRODUCTO YA TIENE OTRO REGISTRO DE INVENTARIO.',
        );
      }

      inventory.product = product;
    }

    if (updateInventoryDto.currentStock !== undefined) {
      inventory.currentStock = updateInventoryDto.currentStock;
    }

    if (updateInventoryDto.minimumStock !== undefined) {
      inventory.minimumStock = updateInventoryDto.minimumStock;
    }

    if (updateInventoryDto.isTracked !== undefined) {
      inventory.isTracked = updateInventoryDto.isTracked;
    }

    if (updateInventoryDto.isPerishable !== undefined) {
      inventory.isPerishable = updateInventoryDto.isPerishable;
    }

    if (updateInventoryDto.expirationDate !== undefined) {
      inventory.expirationDate = updateInventoryDto.expirationDate
        ? new Date(updateInventoryDto.expirationDate)
        : null;
    }

    if (updateInventoryDto.expirationAlertDays !== undefined) {
      inventory.expirationAlertDays = updateInventoryDto.expirationAlertDays;
    }

    if (updateInventoryDto.supplierName !== undefined) {
      inventory.supplierName =
        updateInventoryDto.supplierName?.trim() || null;
    }

    if (updateInventoryDto.lastPurchasePrice !== undefined) {
      inventory.lastPurchasePrice =
        updateInventoryDto.lastPurchasePrice ?? null;
    }

    if (updateInventoryDto.notes !== undefined) {
      inventory.notes = updateInventoryDto.notes?.trim() || null;
    }

    const updatedInventory =
      await this.inventoryRepository.saveInventory(inventory);

    return this.buildInventoryResponse(updatedInventory);
  }

  async deleteInventoryService(uuid: string) {
    const inventory = await this.inventoryRepository.findInventoryByUuid(uuid);

    if (!inventory) {
      throw new NotFoundException('EL INVENTARIO NO EXISTE.');
    }

    await this.inventoryRepository.removeInventory(inventory);

    return {
      message: 'INVENTARIO ELIMINADO CORRECTAMENTE.',
    };
  }

  async createMovementService(createMovementDto: CreateInventoryMovementDto) {
    const inventory = await this.inventoryRepository.findInventoryByUuid(
      createMovementDto.inventoryUuid,
    );

    if (!inventory) {
      throw new NotFoundException('EL INVENTARIO NO EXISTE.');
    }

    if (!inventory.isTracked) {
      throw new BadRequestException(
        'ESTE PRODUCTO NO ESTÁ MARCADO PARA CONTROL DE INVENTARIO.',
      );
    }

    this.validateMovementReason(
      createMovementDto.movementType,
      createMovementDto.reason,
    );

    const previousStock = Number(inventory.currentStock || 0);
    let newStock = previousStock;

    if (createMovementDto.movementType === InventoryMovementType.IN) {
      newStock = previousStock + createMovementDto.quantity;
    }

    if (createMovementDto.movementType === InventoryMovementType.OUT) {
      if (createMovementDto.quantity > previousStock) {
        throw new BadRequestException(
          'NO PUEDES REGISTRAR UNA SALIDA MAYOR AL STOCK ACTUAL.',
        );
      }

      newStock = previousStock - createMovementDto.quantity;
    }

    const movement = this.inventoryRepository.createMovement({
      inventory,
      movementType: createMovementDto.movementType,
      reason: createMovementDto.reason,
      quantity: createMovementDto.quantity,
      previousStock,
      newStock,
      purchasePrice: createMovementDto.purchasePrice ?? null,
      supplierName: createMovementDto.supplierName?.trim() || null,
      expirationDate: createMovementDto.expirationDate
        ? new Date(createMovementDto.expirationDate)
        : null,
      orderUuid: createMovementDto.orderUuid?.trim() || null,
      notes: createMovementDto.notes?.trim() || null,
    });

    inventory.currentStock = newStock;

    if (createMovementDto.purchasePrice !== undefined) {
      inventory.lastPurchasePrice = createMovementDto.purchasePrice;
    }

    if (createMovementDto.supplierName !== undefined) {
      inventory.supplierName =
        createMovementDto.supplierName?.trim() || null;
    }

    if (createMovementDto.expirationDate !== undefined) {
      inventory.expirationDate = createMovementDto.expirationDate
        ? new Date(createMovementDto.expirationDate)
        : null;
    }

    await this.inventoryRepository.saveInventory(inventory);

    const savedMovement =
      await this.inventoryRepository.saveMovement(movement);

    return {
      message: 'MOVIMIENTO DE INVENTARIO REGISTRADO CORRECTAMENTE.',
      movement: savedMovement,
      inventory: this.buildInventoryResponse(inventory),
    };
  }

  async getMovementsByInventoryService(inventoryUuid: string) {
    const inventory = await this.inventoryRepository.findInventoryByUuid(
      inventoryUuid,
    );

    if (!inventory) {
      throw new NotFoundException('EL INVENTARIO NO EXISTE.');
    }

    return this.inventoryRepository.findMovementsByInventoryUuid(
      inventoryUuid,
    );
  }

  async getInventorySummaryService() {
    const inventories = await this.inventoryRepository.findAllInventories();
    const totalMovements = await this.inventoryRepository.countMovements();

    const controlledProducts = inventories.filter(
      (inventory) => inventory.isTracked,
    ).length;

    const lowStock = inventories.filter((inventory) =>
      this.isLowStock(inventory),
    ).length;

    const nearExpiration = inventories.filter((inventory) =>
      this.isNearExpiration(inventory),
    ).length;

    const expired = inventories.filter((inventory) =>
      this.isExpired(inventory),
    ).length;

    return {
      controlledProducts,
      lowStock,
      nearExpiration,
      expired,
      totalMovements,
    };
  }

  private validateMovementReason(
    movementType: InventoryMovementType,
    reason: InventoryMovementReason,
  ) {
    const inReasons = [
      InventoryMovementReason.SUPPLIER_PURCHASE,
      InventoryMovementReason.POSITIVE_ADJUSTMENT,
      InventoryMovementReason.RETURN,
    ];

    const outReasons = [
      InventoryMovementReason.STORE_SALE,
      InventoryMovementReason.ONLINE_SALE,
      InventoryMovementReason.LOSS,
      InventoryMovementReason.EXPIRATION,
      InventoryMovementReason.NEGATIVE_ADJUSTMENT,
    ];

    if (
      movementType === InventoryMovementType.IN &&
      !inReasons.includes(reason)
    ) {
      throw new BadRequestException(
        'EL MOTIVO SELECCIONADO NO CORRESPONDE A UNA ENTRADA DE INVENTARIO.',
      );
    }

    if (
      movementType === InventoryMovementType.OUT &&
      !outReasons.includes(reason)
    ) {
      throw new BadRequestException(
        'EL MOTIVO SELECCIONADO NO CORRESPONDE A UNA SALIDA DE INVENTARIO.',
      );
    }
  }

  private buildInventoryResponse(inventory: any) {
    return {
      ...inventory,
      alerts: {
        lowStock: this.isLowStock(inventory),
        nearExpiration: this.isNearExpiration(inventory),
        expired: this.isExpired(inventory),
        status: this.getInventoryStatus(inventory),
      },
    };
  }

  private isLowStock(inventory: any) {
    return (
      inventory.isTracked === true &&
      Number(inventory.currentStock || 0) <=
        Number(inventory.minimumStock || 0)
    );
  }

  private isExpired(inventory: any) {
    if (!inventory.isPerishable || !inventory.expirationDate) {
      return false;
    }

    const today = this.clearTime(new Date());
    const expirationDate = this.clearTime(new Date(inventory.expirationDate));

    return expirationDate < today;
  }

  private isNearExpiration(inventory: any) {
    if (
      !inventory.isPerishable ||
      !inventory.expirationDate ||
      this.isExpired(inventory)
    ) {
      return false;
    }

    const today = this.clearTime(new Date());
    const expirationDate = this.clearTime(new Date(inventory.expirationDate));

    const alertDate = new Date(today);
    alertDate.setDate(
      alertDate.getDate() + Number(inventory.expirationAlertDays || 0),
    );

    return expirationDate <= alertDate;
  }

  private getInventoryStatus(inventory: any) {
    if (!inventory.isTracked) {
      return 'SIN CONTROL';
    }

    if (this.isExpired(inventory)) {
      return 'VENCIDO';
    }

    if (this.isNearExpiration(inventory)) {
      return 'PRÓXIMO A VENCER';
    }

    if (this.isLowStock(inventory)) {
      return 'BAJO STOCK';
    }

    return 'NORMAL';
  }

  private clearTime(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}