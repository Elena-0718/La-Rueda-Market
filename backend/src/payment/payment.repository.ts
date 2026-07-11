import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../entities/payment.entity';
import { Order } from '../entities/order.entity';
import { User } from '../entities/users.entity';
import { UpdatePaymentDto } from './dtos/update-payment.dto';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  /* =========================
     ADMIN: LISTAR TODOS LOS PAGOS
  ========================= */
  async getAllPaymentsRepository(): Promise<Payment[]> {
    return await this.paymentRepository.find({
      order: { createdAt: 'DESC' },
      relations: [
        'user',
        'order',
        'order.user',
        'order.delivery',
        'order.orderDetails',
        'order.orderDetails.product',
      ],
    });
  }

  /* =========================
     BUSCAR PAGO POR UUID
  ========================= */
  async getPaymentByUuidRepository(
    uuid: string,
  ): Promise<Payment | null> {
    return await this.paymentRepository.findOne({
      where: { uuid },
      relations: [
        'user',
        'order',
        'order.user',
        'order.delivery',
        'order.orderDetails',
        'order.orderDetails.product',
      ],
    });
  }

  /* =========================
     BUSCAR PAGO POR ORDEN
  ========================= */
  async getPaymentByOrderRepository(
    orderUuid: string,
  ): Promise<Payment | null> {
    return await this.paymentRepository.findOne({
      where: {
        order: { uuid: orderUuid },
      },
      relations: [
        'user',
        'order',
        'order.user',
        'order.delivery',
      ],
    });
  }

  /* =========================
     CLIENTE: REGISTRAR PAGO
  ========================= */
  async createPaymentRepository(data: {
    method: PaymentMethod;
    total: number;
    currency: string;
    userUuid: string;
    orderUuid: string;
    reference?: string | null;
    paymentNotes?: string | null;
  }): Promise<Payment> {
    const payment = this.paymentRepository.create({
      method: data.method,
      total: data.total,
      currency: data.currency,
      status: PaymentStatus.PENDING,
      reference:
        data.reference ||
        `REF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      paymentNotes: data.paymentNotes || null,
      user: { uuid: data.userUuid } as User,
      order: { uuid: data.orderUuid } as Order,
    });

    return await this.paymentRepository.save(payment);
  }

  /* =========================
     ADMIN: CONFIRMAR PAGO
  ========================= */
  async confirmPaymentRepository(
    payment: Payment,
  ): Promise<Payment> {
    payment.status = PaymentStatus.CONFIRMED;
    payment.paidAt = new Date();

    return await this.paymentRepository.save(payment);
  }

  /* =========================
     ADMIN: ACTUALIZAR ESTADO
  ========================= */
  async updatePaymentStatusRepository(
    payment: Payment,
    dto: UpdatePaymentDto,
  ): Promise<Payment> {
    if (dto.status !== undefined) {
      payment.status = dto.status;

      if (dto.status === PaymentStatus.CONFIRMED) {
        payment.paidAt = new Date();
      }

      if (
        dto.status === PaymentStatus.REJECTED ||
        dto.status === PaymentStatus.CANCELLED
      ) {
        payment.paidAt = null;
      }
    }

    if (dto.paymentNotes !== undefined) {
      payment.paymentNotes = dto.paymentNotes;
    }

    return await this.paymentRepository.save(payment);
  }

  /* =========================
     ADMIN: RECHAZAR PAGO
  ========================= */
  async rejectPaymentRepository(
    payment: Payment,
  ): Promise<Payment> {
    payment.status = PaymentStatus.REJECTED;
    payment.paidAt = null;

    return await this.paymentRepository.save(payment);
  }
}