import { InputType, Int, Field, Float } from '@nestjs/graphql';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  IsUrl,
  Min,
  MinLength,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field(() => String, { description: 'Product title' })
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @Field(() => String, { description: 'Product description' })
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description: string;

  @Field(() => Float, { description: 'Product price' })
  @IsNumber()
  @Min(0.01, { message: 'Price must be at least 0.01' })
  price: number;

  @Field(() => Int, { description: 'Stock quantity' })
  @IsNumber()
  @Min(0, { message: 'Stock cannot be negative' })
  stock: number;

  @Field(() => Boolean, {
    description: 'Whether the product is published',
    defaultValue: false,
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @Field(() => [Int], {
    description: 'Array of category/tag IDs',
    nullable: true,
  })
  @IsArray()
  @IsOptional()
  categoryIds?: number[];

  @Field(() => [String], {
    description: 'Array of image URLs',
    nullable: true,
  })
  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  imageUrls?: string[];
}
