import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Product } from './product.entity';

/* =========================
   CATEGORÍA DE RECETA
========================= */
export enum RecipeCategory {
  BEEF = 'BEEF',
  CHICKEN = 'CHICKEN',
  PORK = 'PORK',
  FISH = 'FISH',
  QUICK = 'QUICK',
  ECONOMIC = 'ECONOMIC',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  OTHER = 'OTHER',
}

/* =========================
   DIFICULTAD DE RECETA
========================= */
export enum RecipeDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
}

@Entity({ name: 'recipes' })
@Index(['title'])
@Index(['category'])
@Index(['isActive'])
@Index(['isFeatured'])
export class Recipe {
  /* =========================
     IDENTIFICACIÓN
  ========================= */

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  /* =========================
     INFORMACIÓN PRINCIPAL
  ========================= */

  @Column({
    type: 'varchar',
    length: 150,
  })
  title: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'video_url',
  })
  videoUrl?: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  image?: string | null;

  /* =========================
     CLASIFICACIÓN
  ========================= */

  @Column({
    type: 'enum',
    enum: RecipeCategory,
    default: RecipeCategory.OTHER,
  })
  category: RecipeCategory;

  @Column({
    type: 'enum',
    enum: RecipeDifficulty,
    default: RecipeDifficulty.EASY,
  })
  difficulty: RecipeDifficulty;

  /* =========================
     DATOS DE PREPARACIÓN
  ========================= */

  @Column({
    type: 'int',
    nullable: true,
    name: 'preparation_time',
  })
  preparationTime?: number | null;

  @Column({
    type: 'int',
    nullable: true,
  })
  servings?: number | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'ingredient_notes',
  })
  ingredientNotes?: string | null;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  steps?: string[] | null;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
    name: 'extra_ingredients',
  })
  extraIngredients?: string[] | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  tips?: string | null;

  /* =========================
     ESTADO
  ========================= */

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_featured',
  })
  isFeatured: boolean;

  /* =========================
     PRODUCTOS PRINCIPALES
     ACTIVAN EL BOTÓN "VER RECETAS"
     EN EL CATÁLOGO
  ========================= */

  @ManyToMany(() => Product, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'recipe_main_products',
    joinColumn: {
      name: 'recipe_uuid',
      referencedColumnName: 'uuid',
    },
    inverseJoinColumn: {
      name: 'product_uuid',
      referencedColumnName: 'uuid',
    },
  })
  mainProducts: Product[];

  /* =========================
     PRODUCTOS RECOMENDADOS
     SE MUESTRAN DENTRO DE LA RECETA
     PARA QUE EL CLIENTE ELIJA CANTIDAD
  ========================= */

  @ManyToMany(() => Product, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'recipe_products',
    joinColumn: {
      name: 'recipe_uuid',
      referencedColumnName: 'uuid',
    },
    inverseJoinColumn: {
      name: 'product_uuid',
      referencedColumnName: 'uuid',
    },
  })
  products: Product[];

  /* =========================
     FECHAS
  ========================= */

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}