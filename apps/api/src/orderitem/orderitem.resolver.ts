import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrderitemService } from './orderitem.service';
import { OrderItem } from './entities/orderitem.entity';
import { CreateOrderitemInput } from './dto/create-orderitem.input';
import { UpdateOrderitemInput } from './dto/update-orderitem.input';

@Resolver(() => OrderItem)
export class OrderitemResolver {
  constructor(private readonly orderitemService: OrderitemService) {}

  @Mutation(() => OrderItem)
  createOrderitem(@Args('createOrderitemInput') createOrderitemInput: CreateOrderitemInput) {
    return this.orderitemService.create(createOrderitemInput);
  }

  @Query(() => [OrderItem], { name: 'orderitem' })
  findAll() {
    return this.orderitemService.findAll();
  }

  @Query(() => OrderItem, { name: 'orderitem' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.orderitemService.findOne(id);
  }

  @Mutation(() => OrderItem)
  updateOrderitem(@Args('updateOrderitemInput') updateOrderitemInput: UpdateOrderitemInput) {
    return this.orderitemService.update(updateOrderitemInput.id, updateOrderitemInput);
  }

  @Mutation(() => OrderItem)
  removeOrderitem(@Args('id', { type: () => Int }) id: number) {
    return this.orderitemService.remove(id);
  }
}
