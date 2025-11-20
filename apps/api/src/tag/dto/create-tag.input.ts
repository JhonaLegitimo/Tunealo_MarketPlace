import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength, MaxLength } from 'class-validator';

@InputType()
export class CreateTagInput {
  @Field(() => String, { description: 'Tag name (e.g., Brakes, Engine Parts, Suspension)' })
  @IsString()
  @MinLength(2, { message: 'Tag name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Tag name must not exceed 50 characters' })
  name: string;
}
