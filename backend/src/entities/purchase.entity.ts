import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { PurchaseDetail } from './purchase-detail.entity';



export enum PurchaseType {
  INVENTORY = 'INVENTORY',
  SCHEDULED_ORDER = 'SCHEDULED_ORDER',
}

@Entity({ name: 'purchases' })
@Index(['purchaseDate'])
@Index(['purchaseType'])
@Index(['isActive'])
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    type: 'date',
    name: 'purchase_date',
    comment: 'Fecha en la que se realizó la compra de productos',
  })
  purchaseDate: Date;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
    name: 'supplier_name',
    comment: 'Nombre del proveedor o lugar de compra',
  })
  supplierName?: string | null;

  @Column({
    type: 'enum',
    enum: PurchaseType,
    name: 'purchase_type',
    comment: 'Define si la compra es para inventario físico o pedido programado',
  })
  purchaseType: PurchaseType;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    name: 'related_order_uuid',
    comment: 'UUID opcional del pedido programado relacionado',
  })
  relatedOrderUuid?: string | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Valor total de la compra',
  })
  total: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
    comment: 'Permite desactivar la compra sin eliminarla físicamente',
  })
  isActive: boolean;

  @OneToMany(() => PurchaseDetail, (detail) => detail.purchase, {
    cascade: true,
  })
  details: PurchaseDetail[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}