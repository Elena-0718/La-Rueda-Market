import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Cart } from '../entities/cart.entity';
import { CartRepository } from './cart.repository';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
  ) {}

  /* =========================
     CLIENTE: OBTENER O CREAR CARRITO ACTIVO
  ========================= */
  async getOrCreateActiveCart(userUuid: string): Promise<Cart> {
    let cart =
      await this.cartRepository.getActiveCartByUserUuidRepository(userUuid);

    if (!cart) {
      cart = await this.cartRepository.createCartRepository(userUuid);
    }

    return cart;
  }

  /* =========================
     CLIENTE: VACIAR CARRITO ACTIVO
  ========================= */
  async clearActiveCart(userUuid: string) {
    const cart =
      await this.cartRepository.getActiveCartByUserUuidRepository(userUuid);

    if (!cart) {
      throw new NotFoundException('No tienes un carrito activo para vaciar.');
    }

    const updatedCart =
      await this.cartRepository.clearCartRepository(cart);

    return {
      message: 'Carrito vaciado correctamente.',
      cart: updatedCart,
    };
  }

  /* =========================
     CLIENTE: CANCELAR CARRITO ACTIVO
  ========================= */
  async cancelActiveCart(userUuid: string) {
    const cart =
      await this.cartRepository.getActiveCartByUserUuidRepository(userUuid);

    if (!cart) {
      throw new NotFoundException('No tienes un carrito activo para cancelar.');
    }

    const cancelledCart =
      await this.cartRepository.cancelCartRepository(cart);

    return {
      message: 'Carrito cancelado correctamente.',
      cart: cancelledCart,
    };
  }

  /* =========================
     ADMIN: LISTAR TODOS LOS CARRITOS
  ========================= */
  async getAllCarts(): Promise<Cart[]> {
    return await this.cartRepository.getAllCartsRepository();
  }

  /* =========================
     ADMIN: BUSCAR CARRITO POR UUID
  ========================= */
  async getCartByUuid(uuid: string): Promise<Cart> {
    const cart = await this.cartRepository.getCartByUuidRepository(uuid);

    if (!cart) {
      throw new NotFoundException('Carrito no encontrado.');
    }

    return cart;
  }
}