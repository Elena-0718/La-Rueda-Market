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

import { PhysicalSale } from './physical-sale.entity';
import { Product } from './product.entity';

@Entity({ name: 'physical_sale_details' })
@Index(['quantity'])
export class PhysicalSaleDetail {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => PhysicalSale, (physicalSale) => physicalSale.details, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'physical_sale_uuid' })
  physicalSale: PhysicalSale;

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
    comment: 'Cantidad vendida del producto',
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'unit_price',
    comment: 'Precio unitario de venta aplicado en la venta física',
  })
  unitPrice: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'line_total',
    comment: 'Total de la línea de venta física',
  })
  lineTotal: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}