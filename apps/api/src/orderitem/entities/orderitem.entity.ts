import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Product } from 'src/product/entities/product.entity';

@ObjectType()
export class OrderItem {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  orderId: number;

  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  commission: number;

  @Field(() => Float)
  payout: number;

  @Field(() => Product)
  product: Product;
}