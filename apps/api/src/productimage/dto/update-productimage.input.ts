import { CreateProductimageInput } from './create-productimage.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateProductimageInput extends PartialType(CreateProductimageInput) {
  @Field(() => Int)
  id: number;
}
