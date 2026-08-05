import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { FavoriteProductsRepository } from './favorite-products.repository';

@Injectable()
export class FavoriteProductsService {
  constructor(
    private readonly favoriteProductsRepository: FavoriteProductsRepository,
  ) {}

  async getMyFavorites(userUuid: string) {
    const favorites =
      await this.favoriteProductsRepository.findMyFavoritesRepository(userUuid);

    return favorites.map((favorite) => ({
      uuid: favorite.uuid,
      product: favorite.product,
      createdAt: favorite.createdAt,
    }));
  }

  async getMyFavoriteProductUuids(userUuid: string) {
    const favorites =
      await this.favoriteProductsRepository.findMyFavoritesRepository(userUuid);

    return favorites.map((favorite) => favorite.product.uuid);
  }

  async addFavorite(userUuid: string, productUuid: string) {
    const user =
      await this.favoriteProductsRepository.findUserByUuidRepository(userUuid);

    if (!user) {
      throw new NotFoundException('El usuario autenticado no existe.');
    }

    const product =
      await this.favoriteProductsRepository.findProductByUuidRepository(
        productUuid,
      );

    if (!product) {
      throw new NotFoundException('El producto no existe o está inactivo.');
    }

    const existingFavorite =
      await this.favoriteProductsRepository.findFavoriteRepository(
        userUuid,
        productUuid,
      );

    if (existingFavorite) {
      throw new BadRequestException(
        'Este producto ya está marcado como favorito.',
      );
    }

    const favorite =
      this.favoriteProductsRepository.createFavoriteRepository({
        user,
        product,
      });

    const savedFavorite =
      await this.favoriteProductsRepository.saveFavoriteRepository(favorite);

    return {
      message: 'Producto agregado a favoritos correctamente.',
      favorite: {
        uuid: savedFavorite.uuid,
        product: savedFavorite.product,
        createdAt: savedFavorite.createdAt,
      },
    };
  }

  async removeFavorite(userUuid: string, productUuid: string) {
    const favorite =
      await this.favoriteProductsRepository.findFavoriteRepository(
        userUuid,
        productUuid,
      );

    if (!favorite) {
      throw new NotFoundException(
        'Este producto no está marcado como favorito.',
      );
    }

    await this.favoriteProductsRepository.deleteFavoriteRepository(favorite);

    return {
      message: 'Producto quitado de favoritos correctamente.',
    };
  }

  async toggleFavorite(userUuid: string, productUuid: string) {
    const existingFavorite =
      await this.favoriteProductsRepository.findFavoriteRepository(
        userUuid,
        productUuid,
      );

    if (existingFavorite) {
      await this.favoriteProductsRepository.deleteFavoriteRepository(
        existingFavorite,
      );

      return {
        message: 'Producto quitado de favoritos correctamente.',
        isFavorite: false,
      };
    }

    const result = await this.addFavorite(userUuid, productUuid);

    return {
      message: result.message,
      isFavorite: true,
    };
  }
}