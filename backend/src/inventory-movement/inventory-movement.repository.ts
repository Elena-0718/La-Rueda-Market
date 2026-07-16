import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';

@Injectable()
export class InventoryMovementRepository {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly movementRepository: Repository<InventoryMovement>,

    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  findInventoryByUuid(uuid: string) {
    return this.inventoryRepository.findOne({
      where: { uuid },
      relations: {
        product: {
          category: true,
        },
      },
    });
  }

  saveInventory(inventory: Inventory) {
    return this.inventoryRepository.save(inventory);
  }

  createMovement(movementData: Partial<InventoryMovement>) {
    return this.movementRepository.create(movementData);
  }

  saveMovement(movement: InventoryMovement) {
    return this.movementRepository.save(movement);
  }

  findAllMovements() {
    return this.movementRepository.find({
      relations: {
        inventory: {
          product: {
            category: true,
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findMovementByUuid(uuid: string) {
    return this.movementRepository.findOne({
      where: { uuid },
      relations: {
        inventory: {
          product: {
            category: true,
          },
        },
      },
    });
  }

  findMovementsByInventoryUuid(inventoryUuid: string) {
    return this.movementRepository.find({
      where: {
        inventory: {
          uuid: inventoryUuid,
        },
      },
      relations: {
        inventory: {
          product: {
            category: true,
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  removeMovement(movement: InventoryMovement) {
    return this.movementRepository.remove(movement);
  }
}