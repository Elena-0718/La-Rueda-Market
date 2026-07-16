import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { InventoryMovementController } from './inventory-movement.controller';
import { InventoryMovementRepository } from './inventory-movement.repository';
import { InventoryMovementService } from './inventory-movement.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, InventoryMovement])],
  controllers: [InventoryMovementController],
  providers: [InventoryMovementService, InventoryMovementRepository],
  exports: [InventoryMovementService, InventoryMovementRepository],
})
export class InventoryMovementModule {}