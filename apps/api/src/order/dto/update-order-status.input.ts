import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsEnum } from 'class-validator';
import { OrderStatus } from '../../common/enum';

@InputType()
export class UpdateOrderStatusInput {
  @Field(() => Int, { description: 'Order ID' })
  @IsInt()
  orderId: number;

  @Field(() => OrderStatus, { description: 'New order status' })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
