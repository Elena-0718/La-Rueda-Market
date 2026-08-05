import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FavoriteProduct } from '../entities/favorite-product.entity';
import { User } from '../entities/users.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class FavoriteProductsRepository {
  constructor(
    @InjectRepository(FavoriteProduct)
    private readonly favoritesDB: Repository<FavoriteProduct>,

    @InjectRepository(User)
    private readonly usersDB: Repository<User>,

    @InjectRepository(Product)
    private readonly productsDB: Repository<Product>,
  ) {}

  findUserByUuidRepository(userUuid: string): Promise<User | null> {
    return this.usersDB.findOne({
      where: { uuid: userUuid },
    });
  }

  findProductByUuidRepository(productUuid: string): Promise<Product | null> {
    return this.productsDB.findOne({
      where: {
        uuid: productUuid,
        isActive: true,
      },
      relations: {
        category: true,
      },
    });
  }

  findFavoriteRepository(
    userUuid: string,
    productUuid: string,
  ): Promise<FavoriteProduct | null> {
    return this.favoritesDB.findOne({
      where: {
        user: { uuid: userUuid },
        product: { uuid: productUuid },
      },
      relations: {
        user: true,
        product: {
          category: true,
        },
      },
    });
  }

  findMyFavoritesRepository(userUuid: string): Promise<FavoriteProduct[]> {
    return this.favoritesDB.find({
      where: {
        user: { uuid: userUuid },
      },
      relations: {
        product: {
          category: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  createFavoriteRepository(data: Partial<FavoriteProduct>): FavoriteProduct {
    return this.favoritesDB.create(data);
  }

  saveFavoriteRepository(
    favorite: FavoriteProduct,
  ): Promise<FavoriteProduct> {
    return this.favoritesDB.save(favorite);
  }

  async deleteFavoriteRepository(favorite: FavoriteProduct): Promise<void> {
    await this.favoritesDB.remove(favorite);
  }
}