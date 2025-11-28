import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class Question {
    @Field(() => Int)
    id: number;

    @Field()
    content: string;

    @Field({ nullable: true })
    answer?: string;

    @Field(() => Int)
    productId: number;

    @Field(() => Product)
    product: Product;

    @Field(() => Int)
    authorId: number;

    @Field(() => User)
    author: User;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
