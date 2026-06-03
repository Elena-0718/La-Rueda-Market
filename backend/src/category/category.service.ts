import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Category } from '../entities/category.entity';
import { CategoriesRepository } from './category.repository';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';


@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async findAllActive(): Promise<Category[]> {
    return this.categoriesRepository.findAllActiveRepository();
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.findAllRepository();
  }

  async findOne(uuid: string): Promise<Category> {
    const category =
      await this.categoriesRepository.findByIdRepository(uuid);

    if (!category) {
      throw new NotFoundException(
        `No se encontró una categoría activa con el ID ${uuid}.`,
      );
    }

    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existingByName =
      await this.categoriesRepository.findByNameRepository(dto.name);

    if (existingByName) {
      throw new ConflictException(
        'Ya existe una categoría con ese nombre.',
      );
    }

    const slug = this.generateSlug(dto.name);

    const existingBySlug =
      await this.categoriesRepository.findBySlugRepository(slug);

    if (existingBySlug) {
      throw new ConflictException(
        'Ya existe una categoría con un slug equivalente.',
      );
    }

    try {
      return await this.categoriesRepository.createCategoryRepository({
        name: dto.name,
        slug,
        description: dto.description ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: true,
      });
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ocurrió un error al crear la categoría.',
      );
    }
  }

  async update(
    uuid: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category =
      await this.categoriesRepository.findByIdIncludingInactiveRepository(
        uuid,
      );

    if (!category) {
      throw new NotFoundException(
        `No se encontró ninguna categoría con el ID ${uuid}.`,
      );
    }

    const dataToUpdate: Partial<Category> = {};

    if (dto.name && dto.name !== category.name) {
      const existingByName =
        await this.categoriesRepository.findByNameRepository(dto.name);

      if (existingByName && existingByName.uuid !== uuid) {
        throw new ConflictException(
          'Ya existe otra categoría con ese nombre.',
        );
      }

      const newSlug = this.generateSlug(dto.name);

      const existingBySlug =
        await this.categoriesRepository.findBySlugRepository(newSlug);

      if (existingBySlug && existingBySlug.uuid !== uuid) {
        throw new ConflictException(
          'Ya existe otra categoría con un slug equivalente.',
        );
      }

      dataToUpdate.name = dto.name;
      dataToUpdate.slug = newSlug;
    }

    if (dto.description !== undefined) {
      dataToUpdate.description = dto.description;
    }

    if (dto.sortOrder !== undefined) {
      dataToUpdate.sortOrder = dto.sortOrder;
    }

    if (dto.isActive !== undefined) {
      dataToUpdate.isActive = dto.isActive;
    }

    try {
      return await this.categoriesRepository.updateCategoryRepository(
        category,
        dataToUpdate,
      );
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ocurrió un error al actualizar la categoría.',
      );
    }
  }

  async delete(uuid: string): Promise<{ message: string }> {
    const category =
      await this.categoriesRepository.findByIdRepository(uuid);

    if (!category) {
      throw new NotFoundException(
        `No se encontró una categoría activa con el ID ${uuid}.`,
      );
    }

    try {
      return await this.categoriesRepository.deleteCategoryRepository(
        category,
      );
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ocurrió un error al eliminar la categoría.',
      );
    }
  }
}