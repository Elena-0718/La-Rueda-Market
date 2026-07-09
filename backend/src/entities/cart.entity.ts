import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './users.entity';
import { CartDetail } from './cartDetail.entity';

/* =========================
   ENUM ESTADO DEL CARRITO
========================= */
export enum CartStatus {
  ACTIVE = 'ACTIVE',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'cart' })
@Index(['user', 'status'])
export class Cart {
  /* =========================
     IDENTIFICACIÓN
  ========================= */

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  /* =========================
     TOTALES DEL CARRITO
  ========================= */

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Subtotal del carrito antes de impuestos y descuentos.',
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Total de impuestos calculados según los productos del carrito.',
  })
  tax: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Descuentos aplicados al carrito.',
  })
  discount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Total final del carrito.',
  })
  total: number;

  @Column({
    length: 3,
    default: 'COP',
    comment: 'Moneda del carrito. Para La Rueda Market se maneja COP.',
  })
  currency: string;

  /* =========================
     ESTADO DEL CARRITO
  ========================= */

  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.ACTIVE,
    comment: 'Estado del carrito dentro del flujo de compra.',
  })
  status: CartStatus;

  /* =========================
     RELACIONES
  ========================= */

  @ManyToOne(() => User, (user) => user.carts, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_uuid' })
  user: User;

  @OneToMany(() => CartDetail, (cartDetail) => cartDetail.cart, {
    cascade: ['insert', 'update'],
  })
  cartDetails: CartDetail[];

  /* =========================
     AUDITORÍA
  ========================= */

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    type: 'timestamp',
    name: 'closed_at',
    nullable: true,
    comment: 'Fecha en la que el carrito se cerró porque se convirtió en pedido o fue cancelado.',
  })
  closedAt: Date;
}