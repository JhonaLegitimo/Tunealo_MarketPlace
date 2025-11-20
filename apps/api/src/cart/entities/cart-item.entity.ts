import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Product } from '../../product/entities/product.entity';

@ObjectType()
export class CartItem {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  cartId: number;

  @Field(() => Int)
  productId: number;

  @Field(() => Product)
  product: Product;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float, { description: 'Subtotal for this item (price * quantity)' })
  subtotal: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
