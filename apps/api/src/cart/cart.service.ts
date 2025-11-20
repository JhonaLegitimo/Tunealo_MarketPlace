import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartInput } from './dto/add-to-cart.input';
import { UpdateCartItemInput } from './dto/update-cart-item.input';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create cart for user
   */
  private async getOrCreateCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                seller: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  seller: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  /**
   * Calculate cart totals
   */
  private calculateTotals(cart: any) {
    let subtotal = 0;
    let totalItems = 0;

    const items = cart.items.map((item: any) => {
      const itemSubtotal = item.product.price * item.quantity;
      subtotal += itemSubtotal;
      totalItems += item.quantity;

      return {
        ...item,
        subtotal: itemSubtotal,
      };
    });

    return {
      ...cart,
      items,
      subtotal,
      totalItems,
    };
  }

  /**
   * Get cart for user
   */
  async getMyCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    return this.calculateTotals(cart);
  }

  /**
   * Add item to cart
   */
  async addToCart(userId: number, addToCartInput: AddToCartInput) {
    const { productId, quantity } = addToCartInput;

    // Verify product exists and is published
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (!product.published) {
      throw new BadRequestException('This product is not available');
    }

    // Check if enough stock
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Not enough stock. Available: ${product.stock}, Requested: ${quantity}`,
      );
    }

    // Get or create cart
    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        throw new BadRequestException(
          `Not enough stock. Available: ${product.stock}, In cart: ${existingItem.quantity}, Trying to add: ${quantity}`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new cart item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    // Return updated cart
    return this.getMyCart(userId);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(userId: number, updateCartItemInput: UpdateCartItemInput) {
    const { productId, quantity } = updateCartItemInput;

    const cart = await this.getOrCreateCart(userId);

    // Find cart item
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Product ${productId} not found in cart`);
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      throw new BadRequestException(
        `Not enough stock. Available: ${cartItem.product.stock}, Requested: ${quantity}`,
      );
    }

    // Update quantity
    await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    // Return updated cart
    return this.getMyCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: number, productId: number) {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Product ${productId} not found in cart`);
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    // Return updated cart
    return this.getMyCart(userId);
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Return empty cart
    return this.getMyCart(userId);
  }
}
