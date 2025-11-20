import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { OrderStatus } from 'src/common/enum';
import { OrderItem } from 'src/orderitem/entities/orderitem.entity';


@ObjectType()
export class Order {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  buyerId: number;

  @Field(() => Float)
  total: number;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => User)
  buyer: User;

  @Field(() => [OrderItem])
  items: OrderItem[];
}