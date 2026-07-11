import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { Order } from './order.entity';
import { User } from './users.entity';

/* =========================
   MÉTODO DE PAGO
========================= */
export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
}

/* =========================
   ESTADO DEL PAGO
========================= */
export enum PaymentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'payments' })
@Index(['status'])
@Index(['method'])
export class Payment {
  /* =========================
     IDENTIFICACIÓN
  ========================= */

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  /* =========================
     VALOR DEL PAGO
  ========================= */

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: 'Valor total que debe pagar el cliente por la orden.',
  })
  total: number;

  @Column({
    length: 3,
    default: 'COP',
    comment: 'Moneda del pago. Para La Rueda Market se maneja COP.',
  })
  currency: string;

  /* =========================
     MÉTODO Y ESTADO
  ========================= */

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: false,
    comment: 'Método de pago seleccionado por el cliente.',
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    comment: 'Estado actual del pago.',
  })
  status: PaymentStatus;

  /* =========================
     DATOS DE SEGUIMIENTO
  ========================= */

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Referencia del pago, comprobante o número de transferencia.',
  })
  reference: string | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'payment_notes',
    comment: 'Notas internas o aclaraciones sobre el pago.',
  })
  paymentNotes: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'paid_at',
    comment: 'Fecha en la que el pago fue confirmado.',
  })
  paidAt: Date | null;

  /* =========================
     RELACIONES
  ========================= */

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_uuid' })
  user: User;

  @OneToOne(() => Order, (order) => order.payment, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'order_uuid' })
  order: Order;

  /* =========================
     AUDITORÍA
  ========================= */

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}