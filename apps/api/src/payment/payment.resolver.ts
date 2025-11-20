import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { CreatePaymentInput } from './dto/create-payment.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Payment)
@UseGuards(JwtAuthGuard)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => Payment, {
    description: 'Create payment preference for an order',
  })
  createPayment(
    @Args('createPaymentInput') createPaymentInput: CreatePaymentInput,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.createPayment(createPaymentInput, user.id);
  }

  @Query(() => Payment, {
    name: 'paymentByOrder',
    description: 'Get payment information for an order',
  })
  getPaymentByOrder(
    @Args('orderId', { type: () => Int }) orderId: number,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.getPaymentByOrder(orderId, user.id, user.role);
  }
}
