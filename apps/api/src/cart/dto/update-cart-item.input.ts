import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class UpdateCartItemInput {
  @Field(() => Int, { description: 'Product ID in cart' })
  @IsInt()
  productId: number;

  @Field(() => Int, { description: 'New quantity' })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
