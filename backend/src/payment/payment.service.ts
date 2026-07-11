import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreatePaymentDto } from './dtos/create-payment.dto';
import { UpdatePaymentDto } from './dtos/update-payment.dto';
import { PaymentRepository } from './payment.repository';
import { OrderRepository } from '../order/order.repository';
import { PaymentStatus } from '../entities/payment.entity';
import { OrderStatus } from '../entities/order.entity';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
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
     ADMIN: LISTAR PAGOS
  ========================= */
  async getAllPaymentsService() {
    return await this.paymentRepository.getAllPaymentsRepository();
  }

  /* =========================
     CLIENTE: REGISTRAR PAGO
  ========================= */
  async createPaymentService(
    req: any,
    dto: CreatePaymentDto,
  ) {
    const userUuid = this.getUserUuidFromRequest(req);

    const order =
      await this.orderRepository.getOrderByUuidRepository(dto.orderUuid);

    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    if (order.user.uuid !== userUuid) {
      throw new ForbiddenException(
        'No puedes registrar pago para un pedido que no te pertenece.',
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes registrar pago para un pedido cancelado.',
      );
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'No puedes registrar pago para un pedido ya entregado.',
      );
    }

    const existingPayment =
      await this.paymentRepository.getPaymentByOrderRepository(dto.orderUuid);

    if (existingPayment) {
      throw new ConflictException(
        'Este pedido ya tiene un pago registrado.',
      );
    }

    const payment =
      await this.paymentRepository.createPaymentRepository({
        method: dto.method,
        total: Number(order.total),
        currency: order.currency || 'COP',
        userUuid,
        orderUuid: dto.orderUuid,
        reference: dto.reference || null,
        paymentNotes: dto.paymentNotes || null,
      });

    return {
      message: 'Pago registrado correctamente. Queda pendiente de confirmación.',
      payment,
    };
  }

  /* =========================
     ADMIN: CONFIRMAR PAGO
  ========================= */
  async confirmPaymentService(uuid: string) {
    const payment =
      await this.paymentRepository.getPaymentByUuidRepository(uuid);

    if (!payment) {
      throw new NotFoundException('Pago no encontrado.');
    }

    if (payment.status === PaymentStatus.CONFIRMED) {
      throw new ConflictException('El pago ya fue confirmado.');
    }

    if (payment.status === PaymentStatus.REJECTED) {
      throw new BadRequestException(
        'No puedes confirmar un pago rechazado.',
      );
    }

    if (payment.status === PaymentStatus.CANCELLED) {
      throw new BadRequestException(
        'No puedes confirmar un pago cancelado.',
      );
    }

    const confirmedPayment =
      await this.paymentRepository.confirmPaymentRepository(payment);

    if (payment.order) {
      await this.orderRepository.updateOrderStatusRepository(
        payment.order,
        { status: OrderStatus.CONFIRMED },
      );
    }

    return {
      message: 'Pago confirmado correctamente.',
      payment: confirmedPayment,
    };
  }

  /* =========================
     ADMIN: ACTUALIZAR ESTADO
  ========================= */
  async updatePaymentStatusService(
    uuid: string,
    dto: UpdatePaymentDto,
  ) {
    const payment =
      await this.paymentRepository.getPaymentByUuidRepository(uuid);

    if (!payment) {
      throw new NotFoundException('Pago no encontrado.');
    }

    const updatedPayment =
      await this.paymentRepository.updatePaymentStatusRepository(
        payment,
        dto,
      );

    if (dto.status === PaymentStatus.CONFIRMED && payment.order) {
      await this.orderRepository.updateOrderStatusRepository(
        payment.order,
        { status: OrderStatus.CONFIRMED },
      );
    }

    if (
      dto.status === PaymentStatus.REJECTED &&
      payment.order &&
      payment.order.status !== OrderStatus.CANCELLED
    ) {
      await this.orderRepository.updateOrderStatusRepository(
        payment.order,
        { status: OrderStatus.CREATED },
      );
    }

    return {
      message: 'Estado del pago actualizado correctamente.',
      payment: updatedPayment,
    };
  }

  /* =========================
     ADMIN: RECHAZAR PAGO
  ========================= */
  async rejectPaymentService(uuid: string) {
    const payment =
      await this.paymentRepository.getPaymentByUuidRepository(uuid);

    if (!payment) {
      throw new NotFoundException('Pago no encontrado.');
    }

    if (payment.status === PaymentStatus.CONFIRMED) {
      throw new BadRequestException(
        'No puedes rechazar un pago ya confirmado.',
      );
    }

    const rejectedPayment =
      await this.paymentRepository.rejectPaymentRepository(payment);

    return {
      message: 'Pago rechazado correctamente.',
      payment: rejectedPayment,
    };
  }

  /* =========================
     SHARED: VER PAGO POR UUID
  ========================= */
  async getPaymentByUuidService(
    uuid: string,
    req: any,
  ) {
    const userUuid = this.getUserUuidFromRequest(req);

    const payment =
      await this.paymentRepository.getPaymentByUuidRepository(uuid);

    if (!payment) {
      throw new NotFoundException('Pago no encontrado.');
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const isOwner = payment.user.uuid === userUuid;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'No tienes permisos para consultar este pago.',
      );
    }

    return payment;
  }
}