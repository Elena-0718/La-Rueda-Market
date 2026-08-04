import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';

import { Purchase } from './purchase.entity';
import { Product } from './product.entity';

@Entity({ name: 'purchase_details' })
@Index(['updateProductPrice'])
export class PurchaseDetail {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => Purchase, (purchase) => purchase.details, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'purchase_uuid' })
  purchase: Purchase;

  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_uuid' })
  product: Product;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Cantidad comprada del producto',
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'unit_cost',
    comment: 'Precio de compra unitario',
  })
  unitCost: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    name: 'profit_percentage',
    comment: 'Porcentaje de ganancia aplicado sobre el costo unitario',
  })
  profitPercentage: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'suggested_sale_price',
    comment:
      'Precio de venta sugerido calculado automáticamente con margen de ganancia y redondeo',
  })
  suggestedSalePrice: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    name: 'manual_sale_price',
    comment:
      'Precio de venta definido manualmente por el administrador, si decide no usar el sugerido',
  })
  manualSalePrice?: number | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'final_sale_price',
    comment:
      'Precio final que se toma para actualizar el catálogo, sea sugerido o manual',
  })
  finalSalePrice: number;

  @Column({
    type: 'boolean',
    default: false,
    name: 'update_product_price',
    comment: 'Indica si se actualizó el precio de venta del producto',
  })
  updateProductPrice: boolean;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'line_total',
    comment: 'Costo total de la línea de compra',
  })
  lineTotal: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}