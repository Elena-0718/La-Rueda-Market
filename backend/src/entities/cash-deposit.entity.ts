import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CashDepositMethod {
  BANK_DEPOSIT = 'BANK_DEPOSIT',
  BANK_TRANSFER = 'BANK_TRANSFER',
  NEQUI = 'NEQUI',
  DAVIPLATA = 'DAVIPLATA',
  CASH_CORRESPONDENT = 'CASH_CORRESPONDENT',
  OTHER = 'OTHER',
}

@Entity({ name: 'cash_deposits' })
@Index(['depositDate'])
@Index(['depositMethod'])
@Index(['isActive'])
export class CashDeposit {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    type: 'date',
    name: 'deposit_date',
    comment: 'Fecha en la que se realizó la consignación o traslado de efectivo',
  })
  depositDate: Date;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Valor consignado o trasladado desde caja',
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: CashDepositMethod,
    default: CashDepositMethod.BANK_DEPOSIT,
    name: 'deposit_method',
    comment: 'Medio usado para consignar o trasladar el efectivo',
  })
  depositMethod: CashDepositMethod;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
    name: 'destination_account',
    comment: 'Cuenta, banco o billetera destino de la consignación',
  })
  destinationAccount?: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'receipt_number',
    comment: 'Número de comprobante o referencia de la consignación',
  })
  receiptNumber?: string | null;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
    name: 'responsible_name',
    comment: 'Persona responsable de realizar la consignación',
  })
  responsibleName?: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Notas, observaciones o enlace al soporte en Drive',
  })
  notes?: string | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
    comment: 'Permite anular la consignación sin eliminarla físicamente',
  })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}