import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  FulfillmentType,
  Order,
  OrderStatus,
} from '../entities/order.entity';
import { OrderDetail } from '../entities/orderDetail.entity';
import { Inventory } from '../entities/inventory.entity';
import { CartStatus } from '../entities/cart.entity';
import {
  InventoryMovementReason,
  InventoryMovementType,
} from '../entities/inventory-movement.entity';

import { OrderRepository } from './order.repository';
import { CartRepository } from '../cart/cart.repository';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { CreateOrderDto } from './dtos/create-order.dto';
import { AdjustOrderDetailsDto } from './dtos/adjust-order-details.dto';

const SCHEDULED_DELIVERY_COST = 2000;

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
     UTILIDAD: CALCULAR COSTO DE ENTREGA
  ========================= */
  private getDeliveryCostByFulfillmentType(
    fulfillmentType: FulfillmentType,
  ): number {
    if (fulfillmentType === FulfillmentType.PICKUP) {
      return 0;
    }

    if (fulfillmentType === FulfillmentType.SCHEDULED_DELIVERY) {
      return SCHEDULED_DELIVERY_COST;
    }

    throw new BadRequestException('Forma de entrega no válida.');
  }

  /* =========================
     UTILIDAD: VALIDAR DATOS DE ENTREGA
  ========================= */
  private validateFulfillmentData(dto: CreateOrderDto) {
    if (dto.fulfillmentType === FulfillmentType.SCHEDULED_DELIVERY) {
      if (!dto.shippingAddress?.trim()) {
        throw new BadRequestException(
          'Para domicilio programado debes confirmar la dirección, vereda o referencia de entrega.',
        );
      }

      if (!dto.shippingPhone?.trim()) {
        throw new BadRequestException(
          'Para domicilio programado debes confirmar un celular de contacto.',
        );
      }
    }

    if (dto.fulfillmentType === FulfillmentType.PICKUP) {
      if (!dto.shippingPhone?.trim()) {
        throw new BadRequestException(
          'Para recoger en tienda debes confirmar un celular de contacto.',
        );
      }
    }
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

    if (order.status === OrderStatus.DELIVERED) {
      throw new ConflictException(
        'No se puede cambiar el estado de un pedido que ya fue entregado.',
      );
    }

    if (dto.status === OrderStatus.DELIVERED) {
      await this.discountInventoryForDeliveredOrder(order);
    }

    return await this.orderRepository.updateOrderStatusRepository(
      order,
      dto,
    );
  }

  /* =========================
     ADMIN: AJUSTAR PRODUCTOS DEL PEDIDO
  ========================= */
  async adjustOrderDetailsService(
    orderUuid: string,
    dto: AdjustOrderDetailsDto,
  ) {
    const order =
      await this.orderRepository.getOrderByUuidRepository(orderUuid);

    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new ConflictException(
        'No se puede ajustar un pedido cancelado.',
      );
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new ConflictException(
        'No se puede ajustar un pedido que ya fue entregado.',
      );
    }

    if (!order.orderDetails || order.orderDetails.length === 0) {
      throw new BadRequestException(
        'El pedido no tiene productos para ajustar.',
      );
    }

    for (const detailAdjustment of dto.details) {
      const orderDetail = order.orderDetails.find(
        (detail) => detail.uuid === detailAdjustment.orderDetailUuid,
      );

      if (!orderDetail) {
        throw new NotFoundException(
          `NO SE ENCONTRÓ EL DETALLE ${detailAdjustment.orderDetailUuid} EN ESTE PEDIDO.`,
        );
      }

      const shouldKeep = detailAdjustment.keep ?? true;

      if (shouldKeep === false || detailAdjustment.quantity === 0) {
        await this.orderRepository.removeOrderDetailRepository(orderDetail);

        order.orderDetails = order.orderDetails.filter(
          (detail) => detail.uuid !== orderDetail.uuid,
        );

        continue;
      }

      if (detailAdjustment.quantity !== undefined) {
        orderDetail.quantity = detailAdjustment.quantity;
      }

      if (detailAdjustment.unitPrice !== undefined) {
        orderDetail.unitPrice = this.roundMoney(
          Number(detailAdjustment.unitPrice),
        );
      }

      orderDetail.subtotal = this.roundMoney(
        Number(orderDetail.quantity || 0) *
          Number(orderDetail.unitPrice || 0),
      );

      orderDetail.taxAmount = this.roundMoney(
        orderDetail.subtotal *
          (Number(orderDetail.taxRate || 0) / 100),
      );

      orderDetail.total = this.roundMoney(
        orderDetail.subtotal + orderDetail.taxAmount,
      );

      await this.orderRepository.saveOrderDetailRepository(orderDetail);
    }

    if (!order.orderDetails || order.orderDetails.length === 0) {
      throw new BadRequestException(
        'No puedes dejar el pedido sin productos. Cancela el pedido si no se pudo completar.',
      );
    }

    const recalculatedSubtotal = order.orderDetails.reduce(
      (total, detail) => total + Number(detail.subtotal || 0),
      0,
    );

    const recalculatedTax = order.orderDetails.reduce(
      (total, detail) => total + Number(detail.taxAmount || 0),
      0,
    );

    order.subtotal = this.roundMoney(recalculatedSubtotal);
    order.tax = this.roundMoney(recalculatedTax);
    order.total = this.roundMoney(
      order.subtotal +
        order.tax +
        Number(order.deliveryCost || 0) -
        Number(order.discount || 0),
    );

    if (dto.notes?.trim()) {
      const previousNotes = order.deliveryNotes?.trim();

      order.deliveryNotes = previousNotes
        ? `${previousNotes} | Ajuste admin: ${dto.notes.trim()}`
        : `Ajuste admin: ${dto.notes.trim()}`;
    }

    const savedOrder =
      await this.orderRepository.saveOrderRepository(order);

    return {
      message: 'Pedido ajustado correctamente.',
      order: savedOrder,
    };
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

    this.validateFulfillmentData(dto);

    const cart =
      await this.cartRepository.getActiveCartByUserUuidRepository(userUuid);

    if (!cart || !cart.cartDetails || cart.cartDetails.length === 0) {
      throw new BadRequestException(
        'No puedes crear un pedido con el carrito vacío.',
      );
    }

    const fulfillmentType = dto.fulfillmentType;
    const deliveryCost =
      this.getDeliveryCostByFulfillmentType(fulfillmentType);

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
    order.fulfillmentType = fulfillmentType;

    if (fulfillmentType === FulfillmentType.PICKUP) {
      order.shippingAddress = 'RECOGE EN TIENDA';
      order.shippingPhone = dto.shippingPhone?.trim() || null;
      order.deliveryNotes =
        dto.deliveryNotes?.trim() || 'Cliente recoge en tienda.';
    }

    if (fulfillmentType === FulfillmentType.SCHEDULED_DELIVERY) {
      order.shippingAddress = dto.shippingAddress?.trim() || null;
      order.shippingPhone = dto.shippingPhone?.trim() || null;
      order.deliveryNotes = dto.deliveryNotes?.trim() || null;
    }

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
     ADMIN: DESCONTAR INVENTARIO AL ENTREGAR
  ========================= */
  private async discountInventoryForDeliveredOrder(order: Order) {
    if (!order.orderDetails || order.orderDetails.length === 0) {
      throw new BadRequestException(
        'No se puede entregar un pedido sin productos.',
      );
    }

    for (const detail of order.orderDetails) {
      const product = detail.product;

      if (!product) {
        continue;
      }

      const inventory =
        await this.orderRepository.findInventoryByProductUuidRepository(
          product.uuid,
        );

      if (!inventory || inventory.isTracked !== true) {
        continue;
      }

      await this.validateInventoryAvailability(
        inventory,
        Number(detail.quantity || 0),
        product.name,
      );
    }

    for (const detail of order.orderDetails) {
      const product = detail.product;

      if (!product) {
        continue;
      }

      const inventory =
        await this.orderRepository.findInventoryByProductUuidRepository(
          product.uuid,
        );

      if (!inventory || inventory.isTracked !== true) {
        continue;
      }

      await this.applyInventoryOutputForOrder({
        inventory,
        quantity: Number(detail.quantity || 0),
        orderUuid: order.uuid,
        productName: product.name,
      });
    }
  }

  private async validateInventoryAvailability(
    inventory: Inventory,
    quantity: number,
    productName: string,
  ) {
    const previousStock = Number(inventory.currentStock || 0);

    if (quantity > previousStock) {
      throw new BadRequestException(
        `NO HAY STOCK SUFICIENTE PARA "${productName}". STOCK ACTUAL: ${previousStock}. AJUSTA EL INVENTARIO O AJUSTA EL PEDIDO ANTES DE MARCARLO COMO ENTREGADO.`,
      );
    }
  }

  private async applyInventoryOutputForOrder(data: {
    inventory: Inventory;
    quantity: number;
    orderUuid: string;
    productName: string;
  }) {
    const previousStock = Number(data.inventory.currentStock || 0);
    const newStock = this.roundQuantity(previousStock - data.quantity);

    const movement =
      this.orderRepository.createInventoryMovementRepository({
        inventory: data.inventory,
        movementType: InventoryMovementType.OUT,
        reason: InventoryMovementReason.ONLINE_SALE,
        quantity: data.quantity,
        previousStock,
        newStock,
        purchasePrice: data.inventory.lastPurchasePrice ?? null,
        supplierName: data.inventory.supplierName ?? null,
        expirationDate: data.inventory.expirationDate ?? null,
        orderUuid: data.orderUuid,
        notes: `Salida automática por pedido entregado. Producto: ${data.productName}.`,
      });

    data.inventory.currentStock = newStock;

    await this.orderRepository.saveInventoryRepository(data.inventory);
    await this.orderRepository.saveInventoryMovementRepository(movement);
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

  private roundMoney(value: number) {
    return Number(Number(value || 0).toFixed(2));
  }

  private roundQuantity(value: number) {
    return Number(Number(value || 0).toFixed(2));
  }
}