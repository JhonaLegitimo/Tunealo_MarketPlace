import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ProductImage {
  @Field(() => Int)
  id: number;

  @Field()
  url: string;

  @Field(() => Int)
  productId: number;
}

