import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { CartRepository } from '../cart/cart.repository';
import { ProductsRepository } from '../products/products.repository';
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
     NOTA DE NEGOCIO:
     EN LA RUEDA MARKET EL STOCK ES CONTROL INTERNO
     DEL INVENTARIO FÍSICO. NO BLOQUEA LA COMPRA EN LÍNEA,
     PORQUE LOS PEDIDOS PUEDEN SER PROGRAMADOS.
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

    const unitPrice = Number(product.price);

    const existingDetail = cart.cartDetails?.find(
      (detail) => detail.product?.uuid === addProductDto.productUuid,
    );

    if (existingDetail) {
      const newQuantity = existingDetail.quantity + addProductDto.quantity;

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
     NOTA DE NEGOCIO:
     LA CANTIDAD DEL CARRITO TAMPOCO SE BLOQUEA POR STOCK.
     EL ADMIN GESTIONA LA DISPONIBILIDAD DESDE PEDIDOS E INVENTARIO.
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