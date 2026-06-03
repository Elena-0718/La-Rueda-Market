import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { Product } from './product.entity';

@Entity({ name: 'categories' })
@Index(['name'])
@Index(['slug'])
@Index(['isActive'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 120,
    unique: true,
    comment: 'Slug para URLs amigables del catálogo',
  })
  slug: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
    comment: 'Indica si la categoría está visible en el catálogo',
  })
  isActive: boolean;

  @Column({
    type: 'int',
    default: 0,
    name: 'sort_order',
    comment: 'Orden de visualización en el catálogo',
  })
  sortOrder: number;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}