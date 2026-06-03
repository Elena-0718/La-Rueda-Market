import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';


import { UnitMeasure } from '../enum/unit-measure.enum';
import { AvailabilityType } from '../enum/availability-type.enum';
import { Category } from './category.entity';

@Entity({ name: 'products' })
@Index(['name'])
@Index(['isActive'])
@Index(['availabilityType'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({
    type: 'enum',
    enum: UnitMeasure,
    default: UnitMeasure.UNIT,
    name: 'unit_measure',
  })
  unitMeasure: UnitMeasure;

  @Column({
    type: 'enum',
    enum: AvailabilityType,
    default: AvailabilityType.DAILY,
    name: 'availability_type',
  })
  availabilityType: AvailabilityType;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_featured',
  })
  isFeatured: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive: boolean;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  images?: string[];

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_uuid' })
  category: Category;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
