import { CreateOrderitemInput } from './create-orderitem.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateOrderitemInput extends PartialType(CreateOrderitemInput) {
  @Field(() => Int)
  id: number;
}
