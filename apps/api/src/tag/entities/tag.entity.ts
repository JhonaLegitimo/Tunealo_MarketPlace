import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Product } from 'src/product/entities/product.entity';

@ObjectType()
export class Tag {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => [Product], { nullable: true })
  products?: Product[];
}