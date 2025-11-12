import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any) {
    try {
      await this.paymentService.processWebhook(body);
      return { received: true };
    } catch (error) {
      console.error('Webhook processing error:', error);
      // Return 200 even on error to avoid MercadoPago retries
      return { received: true, error: error.message };
    }
  }
}
