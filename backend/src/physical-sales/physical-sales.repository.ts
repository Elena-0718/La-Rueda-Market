import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { PhysicalSale } from '../entities/physical-sale.entity';
import { PhysicalSaleDetail } from '../entities/physical-sale-detail.entity';
import { Product } from '../entities/product.entity';
import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { User } from '../entities/users.entity';

@Injectable()
export class PhysicalSalesRepository {
  constructor(
    @InjectRepository(PhysicalSale)
    private readonly physicalSalesDB: Repository<PhysicalSale>,

    @InjectRepository(PhysicalSaleDetail)
    private readonly physicalSaleDetailsDB: Repository<PhysicalSaleDetail>,

    @InjectRepository(Product)
    private readonly productsDB: Repository<Product>,

    @InjectRepository(Inventory)
    private readonly inventoriesDB: Repository<Inventory>,

    @InjectRepository(InventoryMovement)
    private readonly inventoryMovementsDB: Repository<InventoryMovement>,

    @InjectRepository(User)
    private readonly usersDB: Repository<User>,
  ) {}

  findAllActiveRepository(): Promise<PhysicalSale[]> {
    return this.physicalSalesDB.find({
      where: { isActive: true },
      relations: {
        customerUser: true,
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

  findAllRepository(): Promise<PhysicalSale[]> {
    return this.physicalSalesDB.find({
      relations: {
        customerUser: true,
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

  findAllActiveByDateRangeRepository(
    startDate: string,
    endDate: string,
  ): Promise<PhysicalSale[]> {
    return this.physicalSalesDB.find({
      where: {
        isActive: true,
        saleDate: Between(
          new Date(`${startDate}T00:00:00`),
          new Date(`${endDate}T23:59:59`),
        ),
      },
      relations: {
        customerUser: true,
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

  findByIdRepository(uuid: string): Promise<PhysicalSale | null> {
    return this.physicalSalesDB.findOne({
      where: {
        uuid,
        isActive: true,
      },
      relations: {
        customerUser: true,
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
  ): Promise<PhysicalSale | null> {
    return this.physicalSalesDB.findOne({
      where: { uuid },
      relations: {
        customerUser: true,
        details: {
          product: {
            category: true,
          },
        },
      },
    });
  }

  findUserByUuidRepository(userUuid: string): Promise<User | null> {
    return this.usersDB.findOne({
      where: {
        uuid: userUuid,
      },
    });
  }

  findProductByUuidRepository(productUuid: string): Promise<Product | null> {
    return this.productsDB.findOne({
      where: {
        uuid: productUuid,
        isActive: true,
      },
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

  createPhysicalSaleRepository(data: Partial<PhysicalSale>): PhysicalSale {
    return this.physicalSalesDB.create(data);
  }

  createPhysicalSaleDetailRepository(
    data: Partial<PhysicalSaleDetail>,
  ): PhysicalSaleDetail {
    return this.physicalSaleDetailsDB.create(data);
  }

  createInventoryMovementRepository(
    data: Partial<InventoryMovement>,
  ): InventoryMovement {
    return this.inventoryMovementsDB.create(data);
  }

  savePhysicalSaleRepository(
    physicalSale: PhysicalSale,
  ): Promise<PhysicalSale> {
    return this.physicalSalesDB.save(physicalSale);
  }

  saveInventoryRepository(inventory: Inventory): Promise<Inventory> {
    return this.inventoriesDB.save(inventory);
  }

  saveInventoryMovementRepository(
    movement: InventoryMovement,
  ): Promise<InventoryMovement> {
    return this.inventoryMovementsDB.save(movement);
  }

  updatePhysicalSaleRepository(
    physicalSale: PhysicalSale,
    data: Partial<PhysicalSale>,
  ): Promise<PhysicalSale> {
    Object.assign(physicalSale, data);
    return this.physicalSalesDB.save(physicalSale);
  }

  async deletePhysicalSaleRepository(
    physicalSale: PhysicalSale,
  ): Promise<{ message: string }> {
    physicalSale.isActive = false;

    await this.physicalSalesDB.save(physicalSale);

    return {
      message: 'La venta física fue desactivada correctamente.',
    };
  }
}