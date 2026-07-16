import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class InventoryRepository {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,

    @InjectRepository(InventoryMovement)
    private readonly inventoryMovementRepository: Repository<InventoryMovement>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  findAllInventories() {
    return this.inventoryRepository.find({
      relations: {
        product: {
          category: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findInventoryByUuid(uuid: string) {
    return this.inventoryRepository.findOne({
      where: { uuid },
      relations: {
        product: {
          category: true,
        },
        movements: true,
      },
    });
  }

  findInventoryByProductUuid(productUuid: string) {
    return this.inventoryRepository.findOne({
      where: {
        product: {
          uuid: productUuid,
        },
      },
      relations: {
        product: {
          category: true,
        },
      },
    });
  }

  findProductByUuid(productUuid: string) {
    return this.productRepository.findOne({
      where: { uuid: productUuid },
      relations: {
        category: true,
      },
    });
  }

  createInventory(inventoryData: Partial<Inventory>) {
    return this.inventoryRepository.create(inventoryData);
  }

  saveInventory(inventory: Inventory) {
    return this.inventoryRepository.save(inventory);
  }

  removeInventory(inventory: Inventory) {
    return this.inventoryRepository.remove(inventory);
  }

  createMovement(movementData: Partial<InventoryMovement>) {
    return this.inventoryMovementRepository.create(movementData);
  }

  saveMovement(movement: InventoryMovement) {
    return this.inventoryMovementRepository.save(movement);
  }

  findMovementsByInventoryUuid(inventoryUuid: string) {
    return this.inventoryMovementRepository.find({
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

  countMovements() {
    return this.inventoryMovementRepository.count();
  }
}