import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productsDB: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoriesDB: Repository<Category>,
  ) {}

  async getAllProductsRepository(): Promise<Product[]> {
    return this.productsDB.find({
      where: { isActive: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllProductsAdminRepository(): Promise<Product[]> {
    return this.productsDB.find({
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async getProductByIdRepository(uuid: string): Promise<Product | null> {
    return this.productsDB.findOne({
      where: {
        uuid,
        isActive: true,
      },
      relations: ['category'],
    });
  }

  async getProductByIdAdminRepository(uuid: string): Promise<Product | null> {
    return this.productsDB.findOne({
      where: {
        uuid,
      },
      relations: ['category'],
    });
  }

  async getProductByNameRepository(name: string): Promise<Product | null> {
    return this.productsDB.findOne({
      where: {
        name: ILike(name),
        isActive: true,
      },
    });
  }

  async getProductByNameAdminRepository(name: string): Promise<Product | null> {
    return this.productsDB.findOne({
      where: {
        name: ILike(name),
      },
    });
  }

  async getCategoryByIdRepository(uuid: string): Promise<Category | null> {
    return this.categoriesDB.findOne({
      where: {
        uuid,
        isActive: true,
      },
    });
  }

  async createProductRepository(
    dto: CreateProductDto,
    category: Category,
  ): Promise<Product> {
    const newProduct = this.productsDB.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock,
      unitMeasure: dto.unitMeasure,
      availabilityType: dto.availabilityType,
      isFeatured: dto.isFeatured ?? false,
      images: dto.images ?? [],
      category,
    });

    return this.productsDB.save(newProduct);
  }

  async updateProductRepository(
    product: Product,
    dto: UpdateProductDto,
    category?: Category,
  ): Promise<Product> {
    if (dto.name !== undefined) {
      product.name = dto.name;
    }

    if (dto.description !== undefined) {
      product.description = dto.description;
    }

    if (dto.price !== undefined) {
      product.price = dto.price;
    }

    if (dto.stock !== undefined) {
      product.stock = dto.stock;
    }

    if (dto.unitMeasure !== undefined) {
      product.unitMeasure = dto.unitMeasure;
    }

    if (dto.availabilityType !== undefined) {
      product.availabilityType = dto.availabilityType;
    }

    if (dto.isFeatured !== undefined) {
      product.isFeatured = dto.isFeatured;
    }

    if (dto.isActive !== undefined) {
      product.isActive = dto.isActive;
    }

    if (dto.images !== undefined) {
      product.images = dto.images;
    }

    if (category) {
      product.category = category;
    }

    return this.productsDB.save(product);
  }

  async deleteProductRepository(product: Product) {
    product.isActive = false;

    await this.productsDB.save(product);

    return {
      message: `El producto "${product.name}" fue desactivado correctamente.`,
    };
  }

  async activateProductRepository(product: Product) {
    product.isActive = true;

    await this.productsDB.save(product);

    return {
      message: `El producto "${product.name}" fue activado correctamente.`,
    };
  }
}