import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

import { User } from './users.entity';
import { Product } from './product.entity';

@Entity({ name: 'favorite_products' })
@Unique(['user', 'product'])
@Index(['user'])
@Index(['product'])
export class FavoriteProduct {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_uuid' })
  user: User;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_uuid' })
  product: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}