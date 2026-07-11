import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';

import { Order } from './order.entity';

/* =========================
   ESTADO DEL DOMICILIO
========================= */
export enum DeliveryStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  ON_THE_WAY = 'ON_THE_WAY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'deliveries' })
@Index(['order'], { unique: true })
@Index(['status'])
export class Delivery {
  /* =========================
     IDENTIFICACIÓN
  ========================= */

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  /* =========================
     ESTADO DEL DOMICILIO
  ========================= */

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
    comment: 'Estado actual del domicilio.',
  })
  status: DeliveryStatus;

  /* =========================
     DATOS DE ENTREGA
  ========================= */

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Dirección, vereda o referencia de entrega.',
  })
  address: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'phone_number',
    comment: 'Teléfono de contacto para la entrega.',
  })
  phoneNumber: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'delivery_notes',
    comment: 'Notas adicionales para realizar la entrega.',
  })
  deliveryNotes: string | null;

  @Column({
    type: 'varchar',
    length: 120,
    nullable: true,
    name: 'assigned_to',
    comment: 'Persona encargada del domicilio.',
  })
  assignedTo: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'shipped_at',
    comment: 'Fecha en la que el pedido salió a entrega.',
  })
  shippedAt: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'delivered_at',
    comment: 'Fecha en la que el pedido fue entregado.',
  })
  deliveredAt: Date | null;

  /* =========================
     RELACIÓN CON ORDEN
  ========================= */

  @OneToOne(() => Order, (order) => order.delivery, {
    nullable: false,
    onDelete: 'CASCADE',
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