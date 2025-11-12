import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { AddToCartInput } from './dto/add-to-cart.input';
import { UpdateCartItemInput } from './dto/update-cart-item.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Cart)
@UseGuards(JwtAuthGuard)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  // ==================== QUERIES ====================

  @Query(() => Cart, {
    name: 'myCart',
    description: 'Get current user cart',
  })
  getMyCart(@CurrentUser() user: any) {
    return this.cartService.getMyCart(user.id);
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => Cart, {
    description: 'Add product to cart or increase quantity if already exists',
  })
  addToCart(
    @Args('addToCartInput') addToCartInput: AddToCartInput,
    @CurrentUser() user: any,
  ) {
    return this.cartService.addToCart(user.id, addToCartInput);
  }

  @Mutation(() => Cart, {
    description: 'Update quantity of a product in cart',
  })
  updateCartItem(
    @Args('updateCartItemInput') updateCartItemInput: UpdateCartItemInput,
    @CurrentUser() user: any,
  ) {
    return this.cartService.updateCartItem(user.id, updateCartItemInput);
  }

  @Mutation(() => Cart, {
    description: 'Remove a product from cart',
  })
  removeFromCart(
    @Args('productId', { type: () => Int }) productId: number,
    @CurrentUser() user: any,
  ) {
    return this.cartService.removeFromCart(user.id, productId);
  }

  @Mutation(() => Cart, {
    description: 'Clear entire cart',
  })
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }
}
