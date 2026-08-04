import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order, OrderStatus } from '../entities/order.entity';
import { OrderDetail } from '../entities/orderDetail.entity';
import { Inventory } from '../entities/inventory.entity';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { UpdateOrderDto } from './dtos/update-order.dto';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,

    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,

    @InjectRepository(InventoryMovement)
    private readonly inventoryMovementRepository: Repository<InventoryMovement>,
  ) {}

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

  async saveOrderRepository(order: Order): Promise<Order> {
    return await this.orderRepository.save(order);
  }

  async saveOrderDetailRepository(
    orderDetail: OrderDetail,
  ): Promise<OrderDetail> {
    return await this.orderDetailRepository.save(orderDetail);
  }

  async removeOrderDetailRepository(
    orderDetail: OrderDetail,
  ): Promise<OrderDetail> {
    return await this.orderDetailRepository.remove(orderDetail);
  }

  async findInventoryByProductUuidRepository(
    productUuid: string,
  ): Promise<Inventory | null> {
    return await this.inventoryRepository.findOne({
      where: {
        product: {
          uuid: productUuid,
        },
      },
      relations: {
        product: {
          category: true,
        },
      },
    });
  }

  createInventoryMovementRepository(
    data: Partial<InventoryMovement>,
  ): InventoryMovement {
    return this.inventoryMovementRepository.create(data);
  }

  async saveInventoryRepository(inventory: Inventory): Promise<Inventory> {
    return await this.inventoryRepository.save(inventory);
  }

  async saveInventoryMovementRepository(
    movement: InventoryMovement,
  ): Promise<InventoryMovement> {
    return await this.inventoryMovementRepository.save(movement);
  }

  async cancelOrderByAdminRepository(order: Order) {
    order.status = OrderStatus.CANCELLED;

    await this.orderRepository.save(order);

    return {
      message: 'Pedido cancelado correctamente por administrador.',
      order,
    };
  }

  async createOrderRepository(order: Order): Promise<Order> {
    return await this.orderRepository.save(order);
  }

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

  async cancelOrderByClientRepository(order: Order) {
    order.status = OrderStatus.CANCELLED;

    await this.orderRepository.save(order);

    return {
      message: 'Pedido cancelado correctamente.',
      order,
    };
  }

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