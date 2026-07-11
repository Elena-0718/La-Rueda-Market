import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';

import { User } from './users.entity';
import { OrderDetail } from './orderDetail.entity';
//import { Payment } from './payment.entity';
//import { Delivery } from './delivery.entity';

/* =========================
   ENUM ESTADO DEL PEDIDO
========================= */
export enum OrderStatus {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  ON_THE_WAY = 'ON_THE_WAY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'orders' })
@Index(['user'])
@Index(['status'])
@Index(['createdAt'])
export class Order {
  /* =========================
     IDENTIFICACIÓN
  ========================= */

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  /* =========================
     MONTOS DEL PEDIDO
  ========================= */

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: 'Subtotal del pedido antes de descuentos y total final.',
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Total de impuestos incluidos o calculados para el pedido.',
  })
  tax: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Descuentos aplicados al pedido.',
  })
  discount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    name: 'delivery_cost',
    comment: 'Costo del domicilio asociado al pedido.',
  })
  deliveryCost: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: 'Total final del pedido.',
  })
  total: number;

  @Column({
    length: 3,
    default: 'COP',
    comment: 'Moneda del pedido. Para La Rueda Market se maneja COP.',
  })
  currency: string;

  /* =========================
     DATOS DE ENTREGA CONFIRMADOS
  ========================= */

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'shipping_address',
    comment: 'Dirección, vereda o referencia de entrega confirmada para esta orden.',
  })
  shippingAddress: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'shipping_phone',
    comment: 'Teléfono de contacto confirmado para esta orden.',
  })
  shippingPhone: string | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'delivery_notes',
    comment: 'Notas adicionales para la entrega del pedido.',
  })
  deliveryNotes: string | null;

  /* =========================
     ESTADO DEL PEDIDO
  ========================= */

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CREATED,
    comment: 'Estado actual del pedido dentro del flujo de compra.',
  })
  status: OrderStatus;

  /* =========================
     RELACIONES
  ========================= */

  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_uuid' })
  user: User;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, {
    cascade: ['insert'],
  })
  orderDetails: OrderDetail[];

  //@OneToOne(() => Payment, (payment) => payment.order, { nullable: true,cascade: ['insert'],})payment: Payment | null;//

  //@OneToOne(() => Delivery, (delivery) => delivery.order, {nullable: true,cascade: ['insert'],})delivery: Delivery | null;

  /* =========================
     AUDITORÍA
  ========================= */

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}