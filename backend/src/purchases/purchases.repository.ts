import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Purchase } from '../entities/purchase.entity';
import { PurchaseDetail } from '../entities/purchase-detail.entity';
import { Product } from '../entities/product.entity';
import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';

@Injectable()
export class PurchasesRepository {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchasesDB: Repository<Purchase>,

    @InjectRepository(PurchaseDetail)
    private readonly purchaseDetailsDB: Repository<PurchaseDetail>,

    @InjectRepository(Product)
    private readonly productsDB: Repository<Product>,

    @InjectRepository(Inventory)
    private readonly inventoriesDB: Repository<Inventory>,

    @InjectRepository(InventoryMovement)
    private readonly inventoryMovementsDB: Repository<InventoryMovement>,
  ) {}

  findAllActiveRepository(): Promise<Purchase[]> {
    return this.purchasesDB.find({
      where: { isActive: true },
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

  findAllRepository(): Promise<Purchase[]> {
    return this.purchasesDB.find({
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



  findAllActiveByDateRangeRepository(
    startDate: string,
    endDate: string,
  ): Promise<Purchase[]> {
    return this.purchasesDB.find({
      where: {
        isActive: true,
        purchaseDate: Between(
          new Date(`${startDate}T00:00:00`),
          new Date(`${endDate}T23:59:59`),
        ),
      },
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

  findByIdRepository(uuid: string): Promise<Purchase | null> {
    return this.purchasesDB.findOne({
      where: {
        uuid,
        isActive: true,
      },
      relations: {
        details: {
          product: {
            category: true,
          },
        },
      },
    });
  }

  findByIdIncludingInactiveRepository(
    uuid: string,
  ): Promise<Purchase | null> {
    return this.purchasesDB.findOne({
      where: { uuid },
      relations: {
        details: {
          product: {
            category: true,
          },
        },
      },
    });
  }

  findProductByUuidRepository(productUuid: string): Promise<Product | null> {
    return this.productsDB.findOne({
      where: { uuid: productUuid },
      relations: {
        category: true,
      },
    });
  }

  findInventoryByProductUuidRepository(
    productUuid: string,
  ): Promise<Inventory | null> {
    return this.inventoriesDB.findOne({
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

  createPurchaseRepository(data: Partial<Purchase>): Purchase {
    return this.purchasesDB.create(data);
  }

  createPurchaseDetailRepository(
    data: Partial<PurchaseDetail>,
  ): PurchaseDetail {
    return this.purchaseDetailsDB.create(data);
  }

createInventoryRepository(data: Partial<Inventory>): Inventory {
  return this.inventoriesDB.create(data);
}

  createInventoryMovementRepository(
    data: Partial<InventoryMovement>,
  ): InventoryMovement {
    return this.inventoryMovementsDB.create(data);
  }

  savePurchaseRepository(purchase: Purchase): Promise<Purchase> {
    return this.purchasesDB.save(purchase);
  }

  saveProductRepository(product: Product): Promise<Product> {
    return this.productsDB.save(product);
  }

  saveInventoryRepository(inventory: Inventory): Promise<Inventory> {
    return this.inventoriesDB.save(inventory);
  }

  saveInventoryMovementRepository(
    movement: InventoryMovement,
  ): Promise<InventoryMovement> {
    return this.inventoryMovementsDB.save(movement);
  }

  updatePurchaseRepository(
    purchase: Purchase,
    data: Partial<Purchase>,
  ): Promise<Purchase> {
    Object.assign(purchase, data);
    return this.purchasesDB.save(purchase);
  }

  async deletePurchaseRepository(
    purchase: Purchase,
  ): Promise<{ message: string }> {
    purchase.isActive = false;

    await this.purchasesDB.save(purchase);

    return {
      message: 'La compra fue desactivada correctamente.',
    };
  }
}