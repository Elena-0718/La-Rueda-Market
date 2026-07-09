import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';

import { Cart } from './cart.entity';
import { Product } from './product.entity';

@Entity({ name: 'cart_detail' })
@Unique(['cart', 'product'])
@Index(['cart'])
@Index(['product'])
export class CartDetail {
  /* =========================
     IDENTIFICACIÓN
  ========================= */

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  /* =========================
     CANTIDAD Y PRECIOS
  ========================= */

  @Column({
    type: 'int',
    comment: 'Cantidad del producto agregada al carrito.',
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Precio unitario del producto al momento de agregarlo al carrito.',
  })
  unitPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Subtotal de la línea antes de impuestos. Fórmula: quantity * unitPrice.',
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Porcentaje de IVA aplicado al producto al momento de agregarlo al carrito.',
  })
  taxRate: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Valor del IVA calculado para esta línea del carrito.',
  })
  taxAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Total de la línea. Fórmula: subtotal + taxAmount.',
  })
  total: number;

  /* =========================
     RELACIONES
  ========================= */

  @ManyToOne(() => Cart, (cart) => cart.cartDetails, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_uuid' })
  cart: Cart;

  @ManyToOne(() => Product, (product) => product.cartDetails, {
    nullable: false,
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