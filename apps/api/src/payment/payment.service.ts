import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoConfig, Preference, Payment as MPPayment } from 'mercadopago';
import { CreatePaymentInput } from './dto/create-payment.input';
import { OrderStatus } from '../common/enum';
import { PaymentStatus } from './entities/payment.entity';

@Injectable()
export class PaymentService implements OnModuleInit {
  private mercadopago: MercadoPagoConfig;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      console.warn('⚠️  MercadoPago Access Token not configured. Payment features will not work.');
      return;
    }

    this.mercadopago = new MercadoPagoConfig({
      accessToken,
    });

    console.log('✅ MercadoPago SDK initialized');
  }

  /**
   * Create payment preference for an order
   */
  async createPayment(createPaymentInput: CreatePaymentInput, userId: number) {
    if (!this.mercadopago) {
      throw new BadRequestException('MercadoPago is not configured');
    }

    const { orderId } = createPaymentInput;

    // Get order with items
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Verify buyer
    if (order.buyerId !== userId) {
      throw new ForbiddenException('You can only pay for your own orders');
    }

    // Verify order status
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Can only pay for PENDING orders');
    }

    // Check if payment already exists for this order
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        orderId,
        status: { in: [PaymentStatus.PENDING, PaymentStatus.APPROVED] },
      },
    });

    if (existingPayment) {
      return existingPayment;
    }

    // Create MercadoPago preference
    const preference = new Preference(this.mercadopago);

    const items = order.items.map((item) => ({
      id: item.product.id.toString(),
      title: item.product.title,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      currency_id: 'ARS', // Adjust based on your country
    }));

    const backUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const preferenceData = {
      items,
      payer: {
        name: order.buyer.name,
        email: order.buyer.email,
      },
      back_urls: {
        success: `${backUrl}/payment/success?orderId=${orderId}`,
        failure: `${backUrl}/payment/failure?orderId=${orderId}`,
        pending: `${backUrl}/payment/pending?orderId=${orderId}`,
      },
      auto_return: 'approved' as const,
      notification_url: `${this.configService.get<string>('BACKEND_URL')}/payment/webhook`,
      external_reference: orderId.toString(),
      statement_descriptor: 'Tunealo Marketplace',
    };

    try {
      const response = await preference.create({ body: preferenceData });

      // Save payment in database
      const payment = await this.prisma.payment.create({
        data: {
          orderId,
          amount: order.total,
          status: PaymentStatus.PENDING,
          preferenceId: response.id,
          initPoint: response.init_point,
        },
      });

      return payment;
    } catch (error) {
      console.error('MercadoPago API Error:', error);
      throw new BadRequestException('Failed to create payment preference');
    }
  }

  /**
   * Process MercadoPago webhook notification
   */
  async processWebhook(data: any) {
    if (!this.mercadopago) {
      console.warn('MercadoPago not configured, skipping webhook processing');
      return;
    }

    const { type, data: notificationData } = data;

    // We're only interested in payment notifications
    if (type !== 'payment') {
      return;
    }

    const paymentId = notificationData.id;

    try {
      // Get payment details from MercadoPago
      const mpPaymentClient = new MPPayment(this.mercadopago);
      const paymentInfo = await mpPaymentClient.get({ id: paymentId });

      const externalReference = paymentInfo.external_reference;
      const mpStatus = paymentInfo.status;

      if (!externalReference) {
        console.warn('Payment notification without external reference');
        return;
      }

      const orderId = parseInt(externalReference, 10);

      // Map MercadoPago status to our PaymentStatus
      let paymentStatus: PaymentStatus;
      let orderStatus: OrderStatus;

      switch (mpStatus) {
        case 'approved':
          paymentStatus = PaymentStatus.APPROVED;
          orderStatus = OrderStatus.PAID;
          break;
        case 'rejected':
        case 'cancelled':
          paymentStatus = PaymentStatus.REJECTED;
          orderStatus = OrderStatus.CANCELLED;
          break;
        case 'pending':
        case 'in_process':
        default:
          paymentStatus = PaymentStatus.PENDING;
          orderStatus = OrderStatus.PENDING;
          break;
      }

      // Update payment and order in transaction
      await this.prisma.$transaction(async (tx) => {
        // Update payment
        await tx.payment.updateMany({
          where: { orderId },
          data: {
            mercadopagoId: paymentId.toString(),
            status: paymentStatus,
          },
        });

        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: { status: orderStatus },
        });
      });

      console.log(`✅ Payment ${paymentId} processed for order ${orderId} - Status: ${mpStatus}`);
    } catch (error) {
      console.error('Error processing MercadoPago webhook:', error);
      throw error;
    }
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrder(orderId: number, userId: number, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Check authorization
    const isOwner = order.buyerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have access to this payment');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    if (!payment) {
      throw new NotFoundException(`No payment found for order ${orderId}`);
    }

    return payment;
  }
}
