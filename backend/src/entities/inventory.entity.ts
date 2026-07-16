import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { Product } from './product.entity';
import { InventoryMovement } from './inventory-movement.entity';

@Entity({ name: 'inventories' })
@Index(['isTracked'])
@Index(['isPerishable'])
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @OneToOne(() => Product, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_uuid' })
  product: Product;

  @Column({
    type: 'int',
    default: 0,
    name: 'current_stock',
  })
  currentStock: number;

  @Column({
    type: 'int',
    default: 0,
    name: 'minimum_stock',
  })
  minimumStock: number;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_tracked',
  })
  isTracked: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_perishable',
  })
  isPerishable: boolean;

  @Column({
    type: 'date',
    nullable: true,
    name: 'expiration_date',
  })
  expirationDate?: Date | null;

  @Column({
    type: 'int',
    default: 7,
    name: 'expiration_alert_days',
  })
  expirationAlertDays: number | null;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
    name: 'supplier_name',
  })
  supplierName?: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'last_purchase_price',
  })
  lastPurchasePrice?: number | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string | null;

  @OneToMany(() => InventoryMovement, (movement) => movement.inventory)
  movements: InventoryMovement[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}