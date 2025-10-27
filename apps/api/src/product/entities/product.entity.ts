import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { OrderItem } from 'src/orderitem/entities/orderitem.entity';
import { ProductImage } from 'src/productimage/entities/productimage.entity';
import { Review } from 'src/review/entities/review.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class Product {

  @Field(()=>Int)
  id:number;

  @Field()
  title:string;

  @Field({nullable:true})
  slug?:string;

  @Field()
  description:string;

  @Field(()=>Float)
  price:number;

  @Field(()=>Int)
  stock:number;

  @Field()
  pubished:boolean;

  @Field()
  createAt: Date;

  @Field()
  updateAt: Date;

  @Field(() => User)
  seller: User;

  @Field(() => [Tag], { nullable: true })
  categories?: Tag[];

  @Field(() => [ProductImage], { nullable: true })
  images: ProductImage[];

  @Field(() => [OrderItem], { nullable: true })
  OrderItems: OrderItem[];

  @Field(() => [Review], { nullable: true })
  Reviews: Review[];

}
