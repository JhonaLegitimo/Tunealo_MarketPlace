import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt } from 'class-validator';

@InputType()
export class CreatePaymentInput {
  @Field(() => Int, { description: 'Order ID to create payment for' })
  @IsInt()
  orderId: number;
}
