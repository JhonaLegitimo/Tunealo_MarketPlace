import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class AddToCartInput {
  @Field(() => Int, { description: 'Product ID to add to cart' })
  @IsInt()
  productId: number;

  @Field(() => Int, { description: 'Quantity to add', defaultValue: 1 })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
