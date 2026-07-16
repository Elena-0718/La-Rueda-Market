import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { Inventory } from './inventory.entity';

export enum InventoryMovementType {
  IN = 'IN',
  OUT = 'OUT',
}

export enum InventoryMovementReason {
  SUPPLIER_PURCHASE = 'SUPPLIER_PURCHASE',
  STORE_SALE = 'STORE_SALE',
  ONLINE_SALE = 'ONLINE_SALE',
  LOSS = 'LOSS',
  EXPIRATION = 'EXPIRATION',
  POSITIVE_ADJUSTMENT = 'POSITIVE_ADJUSTMENT',
  NEGATIVE_ADJUSTMENT = 'NEGATIVE_ADJUSTMENT',
  RETURN = 'RETURN',
}

@Entity({ name: 'inventory_movements' })
@Index(['movementType'])
@Index(['reason'])
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => Inventory, (inventory) => inventory.movements, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventory_uuid' })
  inventory: Inventory;

  @Column({
    type: 'enum',
    enum: InventoryMovementType,
    name: 'movement_type',
  })
  movementType: InventoryMovementType;

  @Column({
    type: 'enum',
    enum: InventoryMovementReason,
  })
  reason: InventoryMovementReason;

  @Column({
    type: 'int',
  })
  quantity: number;

  @Column({
    type: 'int',
    name: 'previous_stock',
  })
  previousStock: number;

  @Column({
    type: 'int',
    name: 'new_stock',
  })
  newStock: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'purchase_price',
  })
  purchasePrice?: number | null;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
    name: 'supplier_name',
  })
  supplierName?: string | null;

  @Column({
    type: 'date',
    nullable: true,
    name: 'expiration_date',
  })
  expirationDate?: Date | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'order_uuid',
  })
  orderUuid?: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}