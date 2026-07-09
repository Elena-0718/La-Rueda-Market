import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { CartRepository } from 'src/cart/cart.repository';
import { ProductsRepository } from 'src/products/products.repository';
import { CartDetailRepository } from './cart-detail.repository';
import { AddProductDto } from './dtos/add-product.dto';
import { UpdateProductQuantityDto } from './dtos/update-cartdetail.dto';

@Injectable()
export class CartDetailService {
  constructor(
    private readonly cartDetailRepository: CartDetailRepository,
    private readonly cartRepository: CartRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  /* =========================
     OBTENER UUID DEL USUARIO AUTENTICADO
  ========================= */
  private getUserUuidFromRequest(req: any): string {
    const userUuid =
      req.user?.user_uuid ||
      req.user?.uuid ||
      req.user?.id;

    if (!userUuid) {
      throw new BadRequestException(
        'No se pudo identificar al usuario desde el token.',
      );
    }

    return userUuid;
  }

  /* =========================
     AGREGAR PRODUCTO AL CARRITO
  ========================= */
  async addProductToCartService(
    req: any,
    addProductDto: AddProductDto,
  ) {
    const userUuid = this.getUserUuidFromRequest(req);

    let cart =
      await this.cartRepository.getActiveCartByUserUuidRepository(userUuid);

    if (!cart) {
      cart = await this.cartRepository.createCartRepository(userUuid);
    }

    const product = await this.productsRepository.getProductByIdRepository(
      addProductDto.productUuid,
    );

    if (!product) {
      throw new NotFoundException('Producto no encontrado o inactivo.');
    }

    if (addProductDto.quantity > product.stock) {
      throw new BadRequestException(
        `Solo hay ${product.stock} unidades disponibles de ${product.name}.`,
      );
    }

    const unitPrice = Number(product.price);

    const existingDetail = cart.cartDetails?.find(
      (detail) => detail.product?.uuid === addProductDto.productUuid,
    );

    if (existingDetail) {
      const newQuantity = existingDetail.quantity + addProductDto.quantity;

      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `No puedes agregar ${addProductDto.quantity} unidades más. Solo hay ${product.stock} disponibles de ${product.name}.`,
        );
      }

      return await this.cartDetailRepository.updateProductQuantityRepository(
        existingDetail.uuid,
        newQuantity,
      );
    }

    return await this.cartDetailRepository.addProductToCartRepository(
      cart.uuid,
      addProductDto,
      unitPrice,
    );
  }

  /* =========================
     ACTUALIZAR CANTIDAD
  ========================= */
  async updateProductQuantityService(
    req: any,
    detailUuid: string,
    dto: UpdateProductQuantityDto,
  ) {
    const userUuid = this.getUserUuidFromRequest(req);

    const cart =
      await this.cartRepository.getActiveCartByUserUuidRepository(userUuid);

    if (!cart) {
      throw new NotFoundException('Carrito activo no encontrado.');
    }

    const detail = cart.cartDetails?.find(
      (cartDetail) => cartDetail.uuid === detailUuid,
    );

    if (!detail) {
      throw new NotFoundException(
        'Producto no encontrado en el carrito.',
      );
    }

    const product = await this.productsRepository.getProductByIdRepository(
      detail.product.uuid,
    );

    if (!product) {
      throw new NotFoundException('Producto no encontrado o inactivo.');
    }

    if (dto.quantity > product.stock) {
      throw new BadRequestException(
        `Solo hay ${product.stock} unidades disponibles de ${product.name}.`,
      );
    }

    return await this.cartDetailRepository.updateProductQuantityRepository(
      detailUuid,
      dto.quantity,
    );
  }

  /* =========================
     ELIMINAR PRODUCTO DEL CARRITO
  ========================= */
  async deleteProductFromCartService(
    req: any,
    detailUuid: string,
  ) {
    const userUuid = this.getUserUuidFromRequest(req);

    const cart =
      await this.cartRepository.getActiveCartByUserUuidRepository(userUuid);

    if (!cart) {
      throw new NotFoundException('Carrito activo no encontrado.');
    }

    const result =
      await this.cartDetailRepository.deleteProductFromCartRepository(
        detailUuid,
        cart.uuid,
      );

    if (!result) {
      throw new NotFoundException(
        'Producto no encontrado en el carrito.',
      );
    }

    return result;
  }
}