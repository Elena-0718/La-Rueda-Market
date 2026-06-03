import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesDB: Repository<Category>,
  ) {}

  async findAllActiveRepository(): Promise<Category[]> {
    return this.categoriesDB.find({
      where: { isActive: true },
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findAllRepository(): Promise<Category[]> {
    return this.categoriesDB.find({
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findByIdRepository(uuid: string): Promise<Category | null> {
    return this.categoriesDB.findOne({
      where: {
        uuid,
        isActive: true,
      },
    });
  }

  async findByIdIncludingInactiveRepository(
    uuid: string,
  ): Promise<Category | null> {
    return this.categoriesDB.findOne({
      where: { uuid },
    });
  }

  async findByNameRepository(name: string): Promise<Category | null> {
    return this.categoriesDB.findOne({
      where: {
        name: ILike(name),
      },
    });
  }

  async findBySlugRepository(slug: string): Promise<Category | null> {
    return this.categoriesDB.findOne({
      where: { slug },
    });
  }

  async createCategoryRepository(
    data: Partial<Category>,
  ): Promise<Category> {
    const category = this.categoriesDB.create(data);
    return this.categoriesDB.save(category);
  }

  async updateCategoryRepository(
    category: Category,
    data: Partial<Category>,
  ): Promise<Category> {
    Object.assign(category, data);
    return this.categoriesDB.save(category);
  }

  async deleteCategoryRepository(
    category: Category,
  ): Promise<{ message: string }> {
    category.isActive = false;

    await this.categoriesDB.save(category);

    return {
      message: `La categoría "${category.name}" fue desactivada correctamente.`,
    };
  }
}