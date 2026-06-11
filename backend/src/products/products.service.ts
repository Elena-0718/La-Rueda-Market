import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof Error) {
      return error.message;
    }

    return fallbackMessage;
  }

  async getAllProducts() {
    return this.productsRepository.getAllProductsRepository();
  }

  async getAllProductsAdmin() {
    return this.productsRepository.getAllProductsAdminRepository();
  }

  async getProductById(uuid: string) {
    const product = await this.productsRepository.getProductByIdRepository(uuid);

    if (!product) {
      throw new NotFoundException(`Producto con ID ${uuid} no encontrado.`);
    }

    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const category = await this.productsRepository.getCategoryByIdRepository(
      dto.categoryUuid,
    );

    if (!category) {
      throw new NotFoundException(
        'La categoría enviada no existe o está inactiva.',
      );
    }

    const existingProduct =
      await this.productsRepository.getProductByNameRepository(dto.name);

    if (existingProduct) {
      throw new ConflictException(
        'Ya existe un producto activo con ese nombre.',
      );
    }

    try {
      return await this.productsRepository.createProductRepository(
        dto,
        category,
      );
    } catch (error) {
      throw new BadRequestException(
        this.getErrorMessage(error, 'Error al crear el producto.'),
      );
    }
  }

  async updateProduct(uuid: string, dto: UpdateProductDto) {
    const product =
      await this.productsRepository.getProductByIdAdminRepository(uuid);

    if (!product) {
      throw new NotFoundException(`Producto con ID ${uuid} no encontrado.`);
    }

    let category: Category | undefined;

    if (dto.categoryUuid) {
      const foundCategory =
        await this.productsRepository.getCategoryByIdRepository(
          dto.categoryUuid,
        );

      if (!foundCategory) {
        throw new NotFoundException(
          'La categoría enviada no existe o está inactiva.',
        );
      }

      category = foundCategory;
    }

    if (dto.name && dto.name !== product.name) {
      const existingProduct =
        await this.productsRepository.getProductByNameAdminRepository(dto.name);

      if (existingProduct && existingProduct.uuid !== uuid) {
        throw new ConflictException('Ya existe otro producto con ese nombre.');
      }
    }

    try {
      return await this.productsRepository.updateProductRepository(
        product,
        dto,
        category,
      );
    } catch (error) {
      throw new BadRequestException(
        this.getErrorMessage(error, 'Error al actualizar el producto.'),
      );
    }
  }

  async deleteProduct(uuid: string) {
    const product =
      await this.productsRepository.getProductByIdAdminRepository(uuid);

    if (!product) {
      throw new NotFoundException(`Producto con ID ${uuid} no encontrado.`);
    }

    try {
      return await this.productsRepository.deleteProductRepository(product);
    } catch (error) {
      throw new BadRequestException(
        this.getErrorMessage(error, 'Error al eliminar el producto.'),
      );
    }
  }

  async activateProduct(uuid: string) {
    const product =
      await this.productsRepository.getProductByIdAdminRepository(uuid);

    if (!product) {
      throw new NotFoundException(`Producto con ID ${uuid} no encontrado.`);
    }

    try {
      return await this.productsRepository.activateProductRepository(product);
    } catch (error) {
      throw new BadRequestException(
        this.getErrorMessage(error, 'Error al activar el producto.'),
      );
    }
  }
}