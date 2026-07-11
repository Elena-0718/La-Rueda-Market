import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Order, OrderStatus } from '../entities/order.entity';
import { OrderDetail } from '../entities/orderDetail.entity';
import { CartStatus } from '../entities/cart.entity';
import { OrderRepository } from './order.repository';
import { CartRepository } from '../cart/cart.repository';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { CreateOrderDto } from './dtos/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
  ) {}

  /* =========================
     UTILIDAD: OBTENER USUARIO DEL TOKEN
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
     ADMIN: LISTAR TODAS LAS ÓRDENES
  ========================= */
  async getAllOrdersService() {
    return await this.orderRepository.getAllOrdersRepository();
  }

  /* =========================
     ADMIN: ACTUALIZAR ESTADO
  ========================= */
  async updateOrderStatusService(
    uuid: string,
    dto: UpdateOrderDto,
  ) {
    const order =
      await this.orderRepository.getOrderByUuidRepository(uuid);

    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new ConflictException(
        'No se puede cambiar el estado de un pedido cancelado.',
      );
    }

    return await this.orderRepository.updateOrderStatusRepository(
      order,
      dto,
    );
  }

  /* =========================
     ADMIN: CANCELAR ORDEN
  ========================= */
  async cancelOrderByAdminService(uuid: string) {
    const order =
      await this.orderRepository.getOrderByUuidRepository(uuid);

    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new ConflictException('El pedido ya está cancelado.');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'No se puede cancelar un pedido que ya fue entregado.',
      );
    }

    return await this.orderRepository.cancelOrderByAdminRepository(order);
  }

  /* =========================
     CLIENTE: CREAR ORDEN DESDE CARRITO ACTIVO
  ========================= */
  async createOrderFromCartService(
    req: any,
    dto: CreateOrderDto,
  ) {
    const userUuid = this.getUserUuidFromRequest(req);

    const cart =
      await this.cartRepository.getActiveCartByUserUuidRepository(userUuid);

    if (!cart || !cart.cartDetails || cart.cartDetails.length === 0) {
      throw new BadRequestException(
        'No puedes crear un pedido con el carrito vacío.',
      );
    }

    const deliveryCost = Number(dto.deliveryCost || 0);
    const subtotal = Number(cart.subtotal || 0);
    const tax = Number(cart.tax || 0);
    const discount = Number(cart.discount || 0);
    const total = subtotal + tax + deliveryCost - discount;

    const order = new Order();

    order.user = { uuid: userUuid } as any;
    order.subtotal = subtotal;
    order.tax = tax;
    order.discount = discount;
    order.deliveryCost = deliveryCost;
    order.total = total;
    order.currency = cart.currency || 'COP';
    order.status = OrderStatus.CREATED;

    order.shippingAddress = dto.shippingAddress || null;
    order.shippingPhone = dto.shippingPhone || null;
    order.deliveryNotes = dto.deliveryNotes || null;

    order.orderDetails = cart.cartDetails.map((cartDetail) => {
      const orderDetail = new OrderDetail();

      orderDetail.product = cartDetail.product;
      orderDetail.quantity = cartDetail.quantity;
      orderDetail.unitPrice = Number(cartDetail.unitPrice || 0);
      orderDetail.subtotal = Number(cartDetail.subtotal || 0);
      orderDetail.taxRate = Number(cartDetail.taxRate || 0);
      orderDetail.taxAmount = Number(cartDetail.taxAmount || 0);
      orderDetail.total = Number(cartDetail.total || 0);

      return orderDetail;
    });

    const savedOrder =
      await this.orderRepository.createOrderRepository(order);

    cart.status = CartStatus.CHECKED_OUT;
    cart.closedAt = new Date();

    await this.cartRepository.checkoutCartRepository(cart);

    return {
      message: 'Pedido creado correctamente desde el carrito.',
      order: savedOrder,
    };
  }

  /* =========================
     CLIENTE: HISTORIAL DE ÓRDENES
  ========================= */
  async getMyOrdersService(req: any) {
    const userUuid = this.getUserUuidFromRequest(req);

    return await this.orderRepository.getOrdersHistoryRepository(userUuid);
  }

  /* =========================
     CLIENTE: CANCELAR SU ORDEN
  ========================= */
  async cancelMyOrderService(
    req: any,
    uuid: string,
  ) {
    const userUuid = this.getUserUuidFromRequest(req);

    const order =
      await this.orderRepository.getOrderByUuidRepository(uuid);

    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    if (order.user.uuid !== userUuid) {
      throw new ForbiddenException(
        'No puedes cancelar un pedido que no te pertenece.',
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new ConflictException('El pedido ya está cancelado.');
    }

    if (
      order.status !== OrderStatus.CREATED &&
      order.status !== OrderStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Solo puedes cancelar pedidos recién creados o confirmados.',
      );
    }

    return await this.orderRepository.cancelOrderByClientRepository(order);
  }

  /* =========================
     SHARED: DETALLE DE ORDEN
  ========================= */
  async getOrderByUuidService(
    uuid: string,
    req: any,
  ) {
    const userUuid = this.getUserUuidFromRequest(req);

    const order =
      await this.orderRepository.getOrderByUuidRepository(uuid);

    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const isOwner = order.user.uuid === userUuid;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'No tienes permisos para consultar este pedido.',
      );
    }

    return order;
  }
}