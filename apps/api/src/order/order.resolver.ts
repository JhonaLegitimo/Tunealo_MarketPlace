import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { UpdateOrderStatusInput } from './dto/update-order-status.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enum';

@Resolver(() => Order)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  // ==================== QUERIES ====================

  @Query(() => [Order], {
    name: 'orders',
    description: 'Get all orders (ADMIN only)',
  })
  @Roles(Role.ADMIN)
  findAll() {
    return this.orderService.findAll();
  }

  @Query(() => [Order], {
    name: 'myOrders',
    description: 'Get current user purchase orders',
  })
  findMyOrders(@CurrentUser() user: any) {
    return this.orderService.findByBuyer(user.id);
  }

  @Query(() => [Order], {
    name: 'sellerOrders',
    description: 'Get orders containing products from current seller',
  })
  @Roles(Role.SELLER, Role.ADMIN)
  findSellerOrders(@CurrentUser() user: any) {
    return this.orderService.findBySeller(user.id);
  }

  @Query(() => Order, {
    name: 'order',
    description: 'Get single order by ID',
  })
  findOne(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: any,
  ) {
    return this.orderService.findOne(id, user.id, user.role);
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => Order, {
    description: 'Create order from current user cart',
  })
  createOrderFromCart(@CurrentUser() user: any) {
    return this.orderService.createOrderFromCart(user.id);
  }

  @Mutation(() => Order, {
    description: 'Update order status (seller or admin only)',
  })
  @Roles(Role.SELLER, Role.ADMIN)
  updateOrderStatus(
    @Args('updateOrderStatusInput') updateOrderStatusInput: UpdateOrderStatusInput,
    @CurrentUser() user: any,
  ) {
    return this.orderService.updateStatus(
      updateOrderStatusInput,
      user.id,
      user.role,
    );
  }

  @Mutation(() => Order, {
    description: 'Cancel order (buyer only, PENDING status only)',
  })
  cancelOrder(
    @Args('orderId', { type: () => Int }) orderId: number,
    @CurrentUser() user: any,
  ) {
    return this.orderService.cancel(orderId, user.id);
  }
}
