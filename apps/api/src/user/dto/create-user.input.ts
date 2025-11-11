import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

@InputType()
export class CreateUserInput {

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field(() => Role, { nullable: true, defaultValue: Role.BUYER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

}
