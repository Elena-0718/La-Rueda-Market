import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Purchase } from '../entities/purchase.entity';
import { PurchaseDetail } from '../entities/purchase-detail.entity';
import { Product } from '../entities/product.entity';
import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';

import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { PurchasesRepository } from './purchases.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Purchase,
      PurchaseDetail,
      Product,
      Inventory,
      InventoryMovement,
    ]),
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService, PurchasesRepository],
  exports: [PurchasesService, PurchasesRepository, TypeOrmModule],
})
export class PurchasesModule {}