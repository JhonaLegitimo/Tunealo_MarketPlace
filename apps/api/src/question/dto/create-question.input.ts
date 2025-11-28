import { InputType, Int, Field } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateQuestionInput {
    @Field()
    @IsNotEmpty()
    @IsString()
    content: string;

    @Field(() => Int)
    @IsInt()
    productId: number;
}
