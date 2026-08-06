import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'cash_closings' })
@Index(['closingDate'])
@Index(['isActive'])
export class CashClosing {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    type: 'date',
    name: 'closing_date',
    comment: 'Fecha del cierre o cuadre de caja',
  })
  closingDate: Date;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
    name: 'responsible_name',
    comment: 'Nombre de la persona responsable del cierre de caja',
  })
  responsibleName?: string | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'initial_cash',
    comment: 'Saldo inicial en efectivo al comenzar el día',
  })
  initialCash: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'cash_sales',
    comment: 'Ventas físicas en efectivo registradas durante el día',
  })
  cashSales: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'cash_order_payments',
    comment: 'Pagos en efectivo recibidos por pedidos programados durante el día',
  })
  cashOrderPayments: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'cash_expenses',
    comment: 'Gastos pagados en efectivo durante el día',
  })
  cashExpenses: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'cash_deposits',
    comment: 'Efectivo consignado o trasladado desde caja hacia banco, Nequi, Daviplata u otra cuenta durante el día',
  })
  cashDeposits: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'cash_withdrawals',
    comment: 'Retiros de efectivo de caja durante el día',
  })
  cashWithdrawals: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'expected_cash',
    comment: 'Saldo esperado calculado por el sistema',
  })
  expectedCash: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'counted_cash',
    comment: 'Saldo contado físicamente al cierre',
  })
  countedCash: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Diferencia entre saldo contado y saldo esperado',
  })
  difference: number;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Notas u observaciones del cierre de caja',
  })
  notes?: string | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
    comment: 'Permite anular el cierre sin eliminarlo físicamente',
  })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}