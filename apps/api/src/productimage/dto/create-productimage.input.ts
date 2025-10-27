import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateProductimageInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
