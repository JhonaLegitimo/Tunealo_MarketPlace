import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateQuestionInput {
    @Field(() => Int)
    @IsInt()
    id: number;

    @Field()
    @IsNotEmpty()
    @IsString()
    answer: string;
}
