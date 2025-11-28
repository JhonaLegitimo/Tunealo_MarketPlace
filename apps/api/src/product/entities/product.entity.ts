import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { OrderItem } from 'src/orderitem/entities/orderitem.entity';
import { ProductImage } from 'src/productimage/entities/productimage.entity';
import { Review } from 'src/review/entities/review.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { User } from 'src/user/entities/user.entity';
import { Question } from 'src/question/entities/question.entity';

@ObjectType()
export class Product {

  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  slug?: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock: number;

  @Field()
  published: boolean;

  @Field(() => Float, { nullable: true, description: 'Promedio de calificaciones (1-5)' })
  avgRating?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => User)
  seller: User;

  @Field(() => [Tag], { nullable: true })
  categories?: Tag[];

  @Field(() => [ProductImage])
  images: ProductImage[];

  @Field(() => [OrderItem], { nullable: true })
  OrderItems: OrderItem[];

  @Field(() => [Review], { nullable: true })
  reviews: Review[];

  @Field(() => [Question], { nullable: true })
  questions: Question[];
}
