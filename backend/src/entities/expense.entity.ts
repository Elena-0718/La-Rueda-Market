import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ExpenseCategory {
  FUEL = 'FUEL',
  DELIVERY = 'DELIVERY',
  PACKAGING = 'PACKAGING',
  INTERNET = 'INTERNET',
  PHONE = 'PHONE',
  RENT = 'RENT',
  UTILITIES = 'UTILITIES',
  MAINTENANCE = 'MAINTENANCE',
  ADVERTISING = 'ADVERTISING',
  STATIONERY = 'STATIONERY',
  LABOR = 'LABOR',
  LOSS = 'LOSS',
  OTHER = 'OTHER',
}

export enum ExpensePaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

@Entity({ name: 'expenses' })
@Index(['expenseDate'])
@Index(['category'])
@Index(['isActive'])
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    type: 'date',
    name: 'expense_date',
    comment: 'Fecha en la que se realizó el gasto operativo',
  })
  expenseDate: Date;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
    default: ExpenseCategory.OTHER,
    comment: 'Categoría del gasto operativo',
  })
  category: ExpenseCategory;

  @Column({
    type: 'varchar',
    length: 150,
    comment: 'Descripción breve del gasto operativo',
  })
  description: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Valor del gasto operativo',
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: ExpensePaymentMethod,
    default: ExpensePaymentMethod.CASH,
    name: 'payment_method',
    comment: 'Método de pago usado para cubrir el gasto',
  })
  paymentMethod: ExpensePaymentMethod;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
    comment: 'Permite desactivar el gasto sin eliminarlo físicamente',
  })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}