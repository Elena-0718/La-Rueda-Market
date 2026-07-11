import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import {
  Delivery,
  DeliveryStatus,
} from '../entities/delivery.entity';
import { Order } from '../entities/order.entity';

@Injectable()
export class DeliveryRepository {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
  ) {}

  /* =========================
     ADMIN: LISTAR DOMICILIOS
  ========================= */
  async getAllDeliveriesRepository(): Promise<Delivery[]> {
    return await this.deliveryRepository.find({
      relations: [
        'order',
        'order.user',
        'order.payment',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /* =========================
     BUSCAR DOMICILIO POR UUID
  ========================= */
  async getDeliveryByUuidRepository(
    uuid: string,
  ): Promise<Delivery | null> {
    return await this.deliveryRepository.findOne({
      where: { uuid },
      relations: [
        'order',
        'order.user',
        'order.payment',
      ],
    });
  }

  /* =========================
     BUSCAR DOMICILIO POR ORDEN
  ========================= */
  async getDeliveryByOrderUuidRepository(
    orderUuid: string,
  ): Promise<Delivery | null> {
    return await this.deliveryRepository.findOne({
      where: {
        order: { uuid: orderUuid },
      },
      relations: [
        'order',
        'order.user',
        'order.payment',
      ],
    });
  }

  /* =========================
     CREAR DOMICILIO DESDE ORDEN
  ========================= */
  async createDeliveryRepository(
    order: Order,
    data?: {
      assignedTo?: string | null;
      deliveryNotes?: string | null;
    },
  ): Promise<Delivery> {
    if (!order?.uuid) {
      throw new BadRequestException(
        'Pedido inválido para crear domicilio.',
      );
    }

    if (order.delivery?.uuid) {
      return order.delivery;
    }

    const existingDelivery =
      await this.getDeliveryByOrderUuidRepository(order.uuid);

    if (existingDelivery) {
      return existingDelivery;
    }

    const address =
      order.shippingAddress?.trim() || '';

    const phoneNumber =
      order.shippingPhone?.trim() || '';

    const deliveryNotes =
      data?.deliveryNotes ||
      order.deliveryNotes ||
      null;

    if (!address) {
      throw new BadRequestException(
        'No se puede crear el domicilio porque el pedido no tiene dirección de entrega.',
      );
    }

    if (!phoneNumber) {
      throw new BadRequestException(
        'No se puede crear el domicilio porque el pedido no tiene teléfono de contacto.',
      );
    }

    const delivery = this.deliveryRepository.create({
      order,
      address,
      phoneNumber,
      deliveryNotes,
      assignedTo: data?.assignedTo || null,
      status: DeliveryStatus.PENDING,
      shippedAt: null,
      deliveredAt: null,
    });

    try {
      return await this.deliveryRepository.save(delivery);
    } catch (error) {
      const pgCode = (error as QueryFailedError & { code?: string })?.code;

      if (pgCode === '23505') {
        const alreadyCreated =
          await this.getDeliveryByOrderUuidRepository(order.uuid);

        if (alreadyCreated) {
          return alreadyCreated;
        }
      }

      throw error;
    }
  }

  /* =========================
     ADMIN: ACTUALIZAR ESTADO
  ========================= */
  async updateDeliveryStatusRepository(
    delivery: Delivery,
    status: DeliveryStatus,
  ): Promise<Delivery> {
    delivery.status = status;

    if (status === DeliveryStatus.ON_THE_WAY) {
      delivery.shippedAt = new Date();
    }

    if (status === DeliveryStatus.DELIVERED) {
      delivery.deliveredAt = new Date();
    }

    if (status === DeliveryStatus.CANCELLED) {
      delivery.shippedAt = null;
      delivery.deliveredAt = null;
    }

    return await this.deliveryRepository.save(delivery);
  }
}