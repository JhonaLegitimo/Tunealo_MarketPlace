import { CreateProductInput } from './create-product.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsPositive } from 'class-validator';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field(() => Int)
  @IsInt()
  @IsPositive()
  id: number;
}
