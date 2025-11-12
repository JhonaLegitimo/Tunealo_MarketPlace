import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Payment status from MercadoPago',
});

@ObjectType()
export class Payment {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  mercadopagoId: string;

  @Field(() => Int)
  orderId: number;

  @Field(() => Float)
  amount: number;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field(() => String, { nullable: true })
  preferenceId?: string;

  @Field(() => String, { nullable: true })
  initPoint?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
