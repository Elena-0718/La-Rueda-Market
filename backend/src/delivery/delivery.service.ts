import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DeliveryRepository } from './delivery.repository';
import { OrderRepository } from '../order/order.repository';
import { CreateDeliveryDto } from './dtos/create-delivery.dto';
import { UpdateDeliveryStatusDto } from './dtos/update-delivery-status.dto';
import { DeliveryStatus } from '../entities/delivery.entity';
import { OrderStatus } from '../entities/order.entity';
import { Roles } from '../enum/roles.enum';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly deliveryRepository: DeliveryRepository,
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
     ADMIN: LISTAR DOMICILIOS
  ========================= */
  async getAllDeliveriesService() {
    return await this.deliveryRepository.getAllDeliveriesRepository();
  }

  /* =========================
     ADMIN: CREAR DOMICILIO
  ========================= */
  async createDeliveryService(dto: CreateDeliveryDto) {
    const order =
      await this.orderRepository.getOrderByUuidRepository(dto.orderUuid);

    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'No se puede crear domicilio para un pedido cancelado.',
      );
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'No se puede crear domicilio para un pedido ya entregado.',
      );
    }

    if (order.status === OrderStatus.CREATED) {
      throw new BadRequestException(
        'No se puede crear domicilio para un pedido que aún no ha sido confirmado.',
      );
    }

    const delivery =
      await this.deliveryRepository.createDeliveryRepository(order, {
        assignedTo: dto.assignedTo || null,
        deliveryNotes: dto.deliveryNotes || null,
      });

    return {
      message: 'Domicilio creado correctamente.',
      delivery,
    };
  }

  /* =========================
     ADMIN: ACTUALIZAR ESTADO
  ========================= */
  async updateDeliveryStatusService(
    uuid: string,
    dto: UpdateDeliveryStatusDto,
  ) {
    const delivery =
      await this.deliveryRepository.getDeliveryByUuidRepository(uuid);

    if (!delivery) {
      throw new NotFoundException('Domicilio no encontrado.');
    }

    if (delivery.status === DeliveryStatus.CANCELLED) {
      throw new BadRequestException(
        'No se puede actualizar un domicilio cancelado.',
      );
    }

    if (delivery.status === DeliveryStatus.DELIVERED) {
      throw new BadRequestException(
        'No se puede actualizar un domicilio que ya fue entregado.',
      );
    }

    const updatedDelivery =
      await this.deliveryRepository.updateDeliveryStatusRepository(
        delivery,
        dto.status,
      );

    if (dto.status === DeliveryStatus.PREPARING) {
      await this.orderRepository.updateOrderStatusRepository(
        delivery.order,
        { status: OrderStatus.PREPARING },
      );
    }

    if (dto.status === DeliveryStatus.ON_THE_WAY) {
      await this.orderRepository.updateOrderStatusRepository(
        delivery.order,
        { status: OrderStatus.ON_THE_WAY },
      );
    }

    if (dto.status === DeliveryStatus.DELIVERED) {
      await this.orderRepository.updateOrderStatusRepository(
        delivery.order,
        { status: OrderStatus.DELIVERED },
      );
    }

    if (dto.status === DeliveryStatus.CANCELLED) {
      await this.orderRepository.updateOrderStatusRepository(
        delivery.order,
        { status: OrderStatus.CANCELLED },
      );
    }

    return {
      message: 'Estado del domicilio actualizado correctamente.',
      delivery: updatedDelivery,
    };
  }

  /* =========================
     SHARED: CONSULTAR DOMICILIO
  ========================= */
  async getDeliveryByUuidService(
    uuid: string,
    req: any,
  ) {
    const delivery =
      await this.deliveryRepository.getDeliveryByUuidRepository(uuid);

    if (!delivery) {
      throw new NotFoundException('Domicilio no encontrado.');
    }

    const userUuid = this.getUserUuidFromRequest(req);

    const isAdmin = req.user?.role === Roles.ADMIN;
    const isOwner = delivery.order.user.uuid === userUuid;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'No tienes permisos para consultar este domicilio.',
      );
    }

    return delivery;
  }
}