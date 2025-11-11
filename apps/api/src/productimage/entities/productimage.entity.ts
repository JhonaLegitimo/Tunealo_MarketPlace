import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Product } from 'src/product/entities/product.entity';

@ObjectType()
export class ProductImage {
  @Field(() => Int)
  id: number;

  @Field()
  url: string;

  @Field(() => Product)
  product: Product;
}

