import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order, OrderStatus } from '../entities/order.entity';
import { UpdateOrderDto } from './dtos/update-order.dto';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /* =========================
     ADMIN: LISTAR TODAS LAS ÓRDENES
  ========================= */
  async getAllOrdersRepository(): Promise<Order[]> {
    return await this.orderRepository.find({
      order: { createdAt: 'DESC' },
      relations: [
        'user',
        'payment',
        'delivery',
        'orderDetails',
        'orderDetails.product',
        'orderDetails.product.category',
      ],
    });
  }

  /* =========================
     ADMIN: ACTUALIZAR ESTADO
  ========================= */
  async updateOrderStatusRepository(
    order: Order,
    dto: UpdateOrderDto,
  ) {
    order.status = dto.status;

    await this.orderRepository.save(order);

    return {
      message: `Estado del pedido actualizado a ${dto.status}.`,
      order,
    };
  }

  /* =========================
     ADMIN: CANCELAR ORDEN
  ========================= */
  async cancelOrderByAdminRepository(order: Order) {
    order.status = OrderStatus.CANCELLED;

    await this.orderRepository.save(order);

    return {
      message: 'Pedido cancelado correctamente por administrador.',
      order,
    };
  }

  /* =========================
     CLIENTE: CREAR ORDEN
  ========================= */
  async createOrderRepository(order: Order): Promise<Order> {
    return await this.orderRepository.save(order);
  }

  /* =========================
     CLIENTE: HISTORIAL DE ÓRDENES
  ========================= */
  async getOrdersHistoryRepository(userUuid: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: {
        user: { uuid: userUuid },
      },
      order: { createdAt: 'DESC' },
      relations: [
        'user',
        'payment',
        'delivery',
        'orderDetails',
        'orderDetails.product',
        'orderDetails.product.category',
      ],
    });
  }

  /* =========================
     CLIENTE: CANCELAR SU ORDEN
  ========================= */
  async cancelOrderByClientRepository(order: Order) {
    order.status = OrderStatus.CANCELLED;

    await this.orderRepository.save(order);

    return {
      message: 'Pedido cancelado correctamente.',
      order,
    };
  }

  /* =========================
     SHARED: BUSCAR ORDEN POR UUID
  ========================= */
  async getOrderByUuidRepository(uuid: string): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: { uuid },
      relations: [
        'user',
        'payment',
        'delivery',
        'orderDetails',
        'orderDetails.product',
        'orderDetails.product.category',
      ],
    });
  }
}