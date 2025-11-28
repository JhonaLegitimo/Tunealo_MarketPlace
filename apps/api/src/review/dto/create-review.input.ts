import { InputType, Int, Field } from '@nestjs/graphql';
import { IsInt, IsString, Min, Max, MinLength, IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreateReviewInput {
  @Field(() => Int, { description: 'ID del producto a reseñar' })
  @IsInt()
  productId: number;

  @Field({ description: 'Contenido de la reseña' })
  @IsString()
  @MinLength(10, { message: 'La reseña debe tener al menos 10 caracteres' })
  content: string;

  @Field(() => Int, { description: 'Calificación del producto (1-5)' })
  @IsInt()
  @Min(1, { message: 'La calificación mínima es 1' })
  @Max(5, { message: 'La calificación máxima es 5' })
  rating: number;

  @Field({ nullable: true, description: 'Si la reseña es anónima' })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
