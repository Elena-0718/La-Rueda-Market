import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart, CartStatus } from '../entities/cart.entity';
import { CartDetail } from '../entities/cartDetail.entity';
import { User } from '../entities/users.entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartDetail)
    private readonly cartDetailRepository: Repository<CartDetail>,
  ) {}

  /* =========================
     OBTENER CARRITO ACTIVO POR USUARIO
  ========================= */
  async getActiveCartByUserUuidRepository(
    userUuid: string,
  ): Promise<Cart | null> {
    return await this.cartRepository.findOne({
      where: {
        user: { uuid: userUuid },
        status: CartStatus.ACTIVE,
      },
      relations: [
        'user',
        'cartDetails',
        'cartDetails.product',
        'cartDetails.product.category',
      ],
    });
  }

  /* =========================
     CREAR CARRITO ACTIVO
  ========================= */
  async createCartRepository(userUuid: string): Promise<Cart> {
    const newCart = this.cartRepository.create({
      user: { uuid: userUuid } as User,
      status: CartStatus.ACTIVE,
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      currency: 'COP',
    });

    return await this.cartRepository.save(newCart);
  }

  /* =========================
     RECALCULAR TOTALES DEL CARRITO
  ========================= */
  async recalculateCartTotalsRepository(cartUuid: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { uuid: cartUuid },
      relations: ['cartDetails'],
    });

    if (!cart) {
      throw new Error('Carrito no encontrado para recalcular totales.');
    }

    const subtotal = cart.cartDetails.reduce(
      (acc, item) => acc + Number(item.subtotal || 0),
      0,
    );

    const tax = cart.cartDetails.reduce(
      (acc, item) => acc + Number(item.taxAmount || 0),
      0,
    );

    const discount = Number(cart.discount || 0);
    const total = subtotal + tax - discount;

    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;

    return await this.cartRepository.save(cart);
  }

  /* =========================
     CERRAR CARRITO AL CONVERTIRLO EN PEDIDO
  ========================= */
  async checkoutCartRepository(cart: Cart): Promise<Cart> {
    cart.status = CartStatus.CHECKED_OUT;
    cart.closedAt = new Date();

    return await this.cartRepository.save(cart);
  }

  /* =========================
     CANCELAR CARRITO
  ========================= */
  async cancelCartRepository(cart: Cart): Promise<Cart> {
    cart.status = CartStatus.CANCELLED;
    cart.closedAt = new Date();

    return await this.cartRepository.save(cart);
  }

  /* =========================
     VACIAR CARRITO
  ========================= */
  async clearCartRepository(cart: Cart): Promise<Cart> {
    await this.cartDetailRepository.delete({
      cart: { uuid: cart.uuid },
    });

    cart.cartDetails = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.discount = 0;
    cart.total = 0;

    return await this.cartRepository.save(cart);
  }

  /* =========================
     ADMIN: LISTAR TODOS LOS CARRITOS
  ========================= */
  async getAllCartsRepository(): Promise<Cart[]> {
    return await this.cartRepository.find({
      order: { createdAt: 'DESC' },
      relations: [
        'user',
        'cartDetails',
        'cartDetails.product',
      ],
    });
  }

  /* =========================
     ADMIN: BUSCAR CARRITO POR UUID
  ========================= */
  async getCartByUuidRepository(uuid: string): Promise<Cart | null> {
    return await this.cartRepository.findOne({
      where: { uuid },
      relations: [
        'user',
        'cartDetails',
        'cartDetails.product',
        'cartDetails.product.category',
      ],
    });
  }
}