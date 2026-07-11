import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from '../entities/order.entity';
import { OrderDetail } from '../entities/orderDetail.entity';

@Injectable()
export class OrderDetailRepository {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
  ) {}

  async createOrderDetailsRepository(
    details: OrderDetail[],
  ): Promise<OrderDetail[]> {
    return await this.orderDetailRepository.save(details);
  }

  /* =========================
     ADMIN: VER DETALLES DE CUALQUIER PEDIDO
  ========================= */
  async getOrderDetailsAdminRepository(
    order: Order,
  ): Promise<OrderDetail[]> {
    return await this.orderDetailRepository.find({
      where: {
        order: { uuid: order.uuid },
      },
      relations: [
        'order',
        'product',
        'product.category',
      ],
      order: {
        createdAt: 'ASC',
      },
    });
  }

  /* =========================
     CLIENTE: VER DETALLES DE SU PROPIO PEDIDO
  ========================= */
  async getOrderDetailsClientRepository(
    order: Order,
    userUuid: string,
  ): Promise<OrderDetail[]> {
    return await this.orderDetailRepository.find({
      where: {
        order: {
          uuid: order.uuid,
          user: { uuid: userUuid },
        },
      },
      relations: [
        'order',
        'product',
        'product.category',
      ],
      order: {
        createdAt: 'ASC',
      },
    });
  }
}