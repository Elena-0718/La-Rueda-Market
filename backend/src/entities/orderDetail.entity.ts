import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity({ name: 'order_detail' })
@Index(['order'])
@Index(['product'])
export class OrderDetail {
  /* =========================
     IDENTIFICACIÓN
  ========================= */

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  /* =========================
     CANTIDAD Y PRECIOS CONGELADOS
  ========================= */

  @Column({
    type: 'int',
    nullable: false,
    comment: 'Cantidad del producto comprado.',
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: 'Precio unitario del producto al momento de confirmar el pedido.',
  })
  unitPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: 'Subtotal de la línea antes de impuestos. Se copia desde el detalle del carrito.',
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    name: 'tax_rate',
    comment: 'Porcentaje de impuesto aplicado al producto dentro de la orden.',
  })
  taxRate: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    name: 'tax_amount',
    comment: 'Valor del impuesto aplicado a esta línea de la orden.',
  })
  taxAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: 'Total final de la línea. Fórmula: subtotal + taxAmount.',
  })
  total: number;

  /* =========================
     RELACIONES
  ========================= */

  @ManyToOne(() => Order, (order) => order.orderDetails, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_uuid' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderDetails, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_uuid' })
  product: Product;

  /* =========================
     AUDITORÍA
  ========================= */

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}