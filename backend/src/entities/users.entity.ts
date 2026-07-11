import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Credential } from './credential.entity';
import { Cart } from './cart.entity';
import { Order } from './order.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ length: 150 })
  fullName: string;

  @Index()
  @Column({ length: 20 })
  phone: string;

  @Column({ length: 100 })
  village: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({ type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Credential, (credential) => credential.user, {
    cascade: true,
    eager: false,
  })
  @JoinColumn()
  credential: Credential;

  @OneToMany(() => Cart, (cart) => cart.user)
carts: Cart[];
@OneToMany(() => Order, (order) => order.user)
orders: Order[];

}