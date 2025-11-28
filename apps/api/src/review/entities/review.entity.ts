import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class Review {
  @Field(() => Int)
  id: number;

  @Field()
  content: string;

  @Field(() => Int)
  rating: number; // 1-5

  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  authorId: number;

  @Field()
  isAnonymous: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => Product)
  product: Product;

  @Field(() => User)
  author: User;
}