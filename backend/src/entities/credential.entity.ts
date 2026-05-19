import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './users.entity';
import { Roles } from '../enum/roles.enum';

@Entity({ name: 'credentials' })
export class Credential {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  phone: string;

  @Column({
    type: 'varchar',
    select: false,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.CLIENT,
  })
  role: Roles;

  @Column({
    type: 'text',
    nullable: true,
    select: false,
  })
  refreshToken: string | null;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    select: false,
  })
  resetCode: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  resetCodeExpiresAt: Date | null;

  @Column({
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.credential)
  user: User;
}