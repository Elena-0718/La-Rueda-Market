import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { PhysicalSaleDetail } from './physical-sale-detail.entity';



export enum PhysicalSalePaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

@Entity({ name: 'physical_sales' })
@Index(['saleDate'])
@Index(['paymentMethod'])
@Index(['isActive'])
export class PhysicalSale {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    type: 'date',
    name: 'sale_date',
    comment: 'Fecha en la que se realizó la venta física en el local',
  })
  saleDate: Date;

  @Column({
    type: 'enum',
    enum: PhysicalSalePaymentMethod,
    default: PhysicalSalePaymentMethod.CASH,
    name: 'payment_method',
    comment: 'Método de pago usado en la venta física',
  })
  paymentMethod: PhysicalSalePaymentMethod;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Subtotal de la venta física',
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Total final de la venta física',
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
    comment: 'Permite desactivar la venta física sin eliminarla físicamente',
  })
  isActive: boolean;

  @OneToMany(() => PhysicalSaleDetail, (detail) => detail.physicalSale, {
    cascade: true,
  })
  details: PhysicalSaleDetail[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}