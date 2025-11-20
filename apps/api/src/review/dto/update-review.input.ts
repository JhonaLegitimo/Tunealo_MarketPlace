import { InputType, Field, Int, PartialType, OmitType } from '@nestjs/graphql';
import { CreateReviewInput } from './create-review.input';
import { IsInt } from 'class-validator';

@InputType()
export class UpdateReviewInput extends PartialType(
  OmitType(CreateReviewInput, ['productId'] as const),
) {
  @Field(() => Int, { description: 'ID de la reseña a actualizar' })
  @IsInt()
  id: number;
}
