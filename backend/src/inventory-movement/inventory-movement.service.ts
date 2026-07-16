import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateInventoryMovementDto } from './dtos/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from './dtos/update-inventory-movement.dto';
import { InventoryMovementRepository } from './inventory-movement.repository';
import {
  InventoryMovementReason,
  InventoryMovementType,
} from '../entities/inventory-movement.entity';

@Injectable()
export class InventoryMovementService {
  constructor(
    private readonly inventoryMovementRepository: InventoryMovementRepository,
  ) {}

  async createMovementService(
    createMovementDto: CreateInventoryMovementDto,
  ) {
    const inventory =
      await this.inventoryMovementRepository.findInventoryByUuid(
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

    const movement = this.inventoryMovementRepository.createMovement({
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

    await this.inventoryMovementRepository.saveInventory(inventory);

    const savedMovement =
      await this.inventoryMovementRepository.saveMovement(movement);

    return {
      message: 'MOVIMIENTO DE INVENTARIO REGISTRADO CORRECTAMENTE.',
      movement: savedMovement,
      inventory,
    };
  }

  async getAllMovementsService() {
    return this.inventoryMovementRepository.findAllMovements();
  }

  async getMovementByUuidService(uuid: string) {
    const movement =
      await this.inventoryMovementRepository.findMovementByUuid(uuid);

    if (!movement) {
      throw new NotFoundException('EL MOVIMIENTO DE INVENTARIO NO EXISTE.');
    }

    return movement;
  }

  async getMovementsByInventoryService(inventoryUuid: string) {
    const inventory =
      await this.inventoryMovementRepository.findInventoryByUuid(
        inventoryUuid,
      );

    if (!inventory) {
      throw new NotFoundException('EL INVENTARIO NO EXISTE.');
    }

    return this.inventoryMovementRepository.findMovementsByInventoryUuid(
      inventoryUuid,
    );
  }

  async updateMovementService(
    uuid: string,
    updateMovementDto: UpdateInventoryMovementDto,
  ) {
    const movement =
      await this.inventoryMovementRepository.findMovementByUuid(uuid);

    if (!movement) {
      throw new NotFoundException('EL MOVIMIENTO DE INVENTARIO NO EXISTE.');
    }

    if (updateMovementDto.purchasePrice !== undefined) {
      movement.purchasePrice = updateMovementDto.purchasePrice;
    }

    if (updateMovementDto.supplierName !== undefined) {
      movement.supplierName =
        updateMovementDto.supplierName?.trim() || null;
    }

    if (updateMovementDto.expirationDate !== undefined) {
      movement.expirationDate = updateMovementDto.expirationDate
        ? new Date(updateMovementDto.expirationDate)
        : null;
    }

    if (updateMovementDto.orderUuid !== undefined) {
      movement.orderUuid = updateMovementDto.orderUuid?.trim() || null;
    }

    if (updateMovementDto.notes !== undefined) {
      movement.notes = updateMovementDto.notes?.trim() || null;
    }

    return this.inventoryMovementRepository.saveMovement(movement);
  }

  async deleteMovementService(uuid: string) {
    const movement =
      await this.inventoryMovementRepository.findMovementByUuid(uuid);

    if (!movement) {
      throw new NotFoundException('EL MOVIMIENTO DE INVENTARIO NO EXISTE.');
    }

    await this.inventoryMovementRepository.removeMovement(movement);

    return {
      message:
        'MOVIMIENTO ELIMINADO CORRECTAMENTE. RECUERDA QUE ESTA ACCIÓN NO MODIFICA EL STOCK ACTUAL.',
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
}