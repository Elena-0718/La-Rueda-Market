import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Order } from '../entities/order.entity';
import { OrderRepository } from '../order/order.repository';
import { OrderDetailRepository } from './order-detail.repository';

@Injectable()
export class OrderDetailService {
  constructor(
    private readonly orderDetailRepository: OrderDetailRepository,
    private readonly orderRepository: OrderRepository,
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
     ADMIN: VER DETALLES DE CUALQUIER PEDIDO
  ========================= */
  async getOrderDetailsAdminService(
    orderUuid: string,
  ) {
    const order: Order | null =
      await this.orderRepository.getOrderByUuidRepository(orderUuid);

    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    return await this.orderDetailRepository.getOrderDetailsAdminRepository(
      order,
    );
  }

  /* =========================
     CLIENTE: VER DETALLES DE SU PROPIO PEDIDO
  ========================= */
  async getOrderDetailsClientService(
    req: any,
    orderUuid: string,
  ) {
    const userUuid = this.getUserUuidFromRequest(req);

    const order: Order | null =
      await this.orderRepository.getOrderByUuidRepository(orderUuid);

    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    if (order.user.uuid !== userUuid) {
      throw new ForbiddenException(
        'No tienes permiso para consultar los detalles de este pedido.',
      );
    }

    return await this.orderDetailRepository.getOrderDetailsClientRepository(
      order,
      userUuid,
    );
  }
}