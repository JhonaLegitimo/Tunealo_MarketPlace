// user/entities/user.entity.ts
import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Role as PrismaRole } from '@prisma/client';
import { Order } from 'src/order/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
import { Review } from 'src/review/entities/review.entity';

// Register Prisma enum for GraphQL
registerEnumType(PrismaRole, { name: 'Role' });

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => PrismaRole)
  role: PrismaRole;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(()=>[Product], {nullable:true})
  products?:Product[];

  @Field(()=>[Order], {nullable:true})
  orders?:Order[];

  @Field(()=>[Review], {nullable:true})
  reviews?:Review[];
}
