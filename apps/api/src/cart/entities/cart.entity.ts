import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { CartItem } from './cart-item.entity';
import { User } from '../../user/entities/user.entity';

@ObjectType()
export class Cart {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [CartItem])
  items: CartItem[];

  @Field(() => Float, { description: 'Total price of all items in cart' })
  subtotal: number;

  @Field(() => Int, { description: 'Total number of items in cart' })
  totalItems: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
