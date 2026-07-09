import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartDetail } from 'src/entities/cartDetail.entity';
import { Cart } from 'src/entities/cart.entity';
import { Product } from 'src/entities/product.entity';
import { CartRepository } from 'src/cart/cart.repository';
import { AddProductDto } from './dtos/add-product.dto';

@Injectable()
export class CartDetailRepository {
  constructor(
    @InjectRepository(CartDetail)
    private readonly cartDetailRepository: Repository<CartDetail>,

    private readonly cartRepository: CartRepository,
  ) {}

  /* =========================
     AGREGAR PRODUCTO AL CARRITO
  ========================= */
  async addProductToCartRepository(
    cartUuid: string,
    addProductDto: AddProductDto,
    unitPrice: number,
  ) {
    const quantity = addProductDto.quantity;

    /*
      Para este PMV, Product no maneja taxRate.
      Dejamos la estructura preparada en CartDetail.
      Inicialmente el IVA queda en 0.
    */
    const taxRate = 0;
    const subtotal = quantity * unitPrice;
    const taxAmount = 0;
    const total = subtotal + taxAmount;

    const newDetail = this.cartDetailRepository.create({
      quantity,
      unitPrice,
      subtotal,
      taxRate,
      taxAmount,
      total,
      cart: { uuid: cartUuid } as Cart,
      product: { uuid: addProductDto.productUuid } as Product,
    });

    const savedDetail = await this.cartDetailRepository.save(newDetail);

    await this.cartRepository.recalculateCartTotalsRepository(cartUuid);

    return {
      message: 'Producto agregado al carrito correctamente.',
      detail: savedDetail,
    };
  }

  /* =========================
     ACTUALIZAR CANTIDAD
  ========================= */
  async updateProductQuantityRepository(
    detailUuid: string,
    quantity: number,
  ) {
    const detail = await this.cartDetailRepository.findOne({
      where: { uuid: detailUuid },
      relations: ['cart', 'product'],
    });

    if (!detail) {
      return null;
    }

    const unitPrice = Number(detail.unitPrice);
    const taxRate = Number(detail.taxRate || 0);

    /*
      Como el precio del producto se maneja como precio final visible,
      y por ahora taxRate está en 0, el total queda igual al subtotal.
      Si más adelante taxRate cambia, aquí se puede calcular el desglose.
    */
    const subtotal = quantity * unitPrice;
    const taxAmount = 0;
    const total = subtotal + taxAmount;

    detail.quantity = quantity;
    detail.subtotal = subtotal;
    detail.taxRate = taxRate;
    detail.taxAmount = taxAmount;
    detail.total = total;

    const savedDetail = await this.cartDetailRepository.save(detail);

    await this.cartRepository.recalculateCartTotalsRepository(detail.cart.uuid);

    return {
      message: `Cantidad del producto actualizada a ${quantity}.`,
      detail: savedDetail,
    };
  }

  /* =========================
     ELIMINAR PRODUCTO DEL CARRITO
  ========================= */
  async deleteProductFromCartRepository(
    detailUuid: string,
    cartUuid: string,
  ) {
    const detail = await this.cartDetailRepository.findOne({
      where: {
        uuid: detailUuid,
        cart: { uuid: cartUuid },
      },
      relations: ['cart'],
    });

    if (!detail) {
      return null;
    }

    await this.cartDetailRepository.remove(detail);

    await this.cartRepository.recalculateCartTotalsRepository(cartUuid);

    return {
      message: 'Producto eliminado del carrito correctamente.',
    };
  }
}