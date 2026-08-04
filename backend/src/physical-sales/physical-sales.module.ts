import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PhysicalSale } from '../entities/physical-sale.entity';
import { PhysicalSaleDetail } from '../entities/physical-sale-detail.entity';
import { Product } from '../entities/product.entity';
import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { User } from '../entities/users.entity';

import { PhysicalSalesController } from './physical-sales.controller';
import { PhysicalSalesService } from './physical-sales.service';
import { PhysicalSalesRepository } from './physical-sales.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PhysicalSale,
      PhysicalSaleDetail,
      Product,
      Inventory,
      InventoryMovement,
      User,
    ]),
  ],
  controllers: [PhysicalSalesController],
  providers: [PhysicalSalesService, PhysicalSalesRepository],
  exports: [PhysicalSalesService, PhysicalSalesRepository, TypeOrmModule],
})
export class PhysicalSalesModule {}