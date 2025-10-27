import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateOrderitemInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
