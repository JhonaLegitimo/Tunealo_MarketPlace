import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '../common/enum';
import { UpdateOrderStatusInput } from './dto/update-order-status.input';

@Injectable()
export class OrderService {
  // Commission rate (10% for the platform)
  private readonly COMMISSION_RATE = 0.1;

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Create order from user's cart
   */
  async createOrderFromCart(userId: number) {
    // Get user's cart with items
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
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

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (!item.product.published) {
        throw new BadRequestException(
          `Product "${item.product.title}" is no longer available`,
        );
      }

      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${item.product.title}". Available: ${item.product.stock}, Requested: ${item.quantity}`,
        );
      }
    }

    // Calculate total
    let total = 0;
    const orderItems = cart.items.map((item) => {
      const itemTotal = item.product.price * item.quantity;
      total += itemTotal;

      const commission = itemTotal * this.COMMISSION_RATE;
      const payout = itemTotal - commission;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product.price,
        commission,
        payout,
      };
    });

    // Create order and update stock in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order with items
      const newOrder = await tx.order.create({
        data: {
          buyerId: userId,
          total,
          status: OrderStatus.PENDING,
          items: {
            create: orderItems,
          },
        },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
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

      // Update stock for each product
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return order;
  }

  /**
   * Find all orders (ADMIN only)
   */
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find orders by buyer
   */
  async findByBuyer(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { buyerId: userId },
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
      orderBy: {
        createdAt: 'desc',
      },
    });
    return orders;
  }

  /**
   * Find orders where user is a seller
   */
  async findBySeller(sellerId: number) {
    // Find all order items where the product belongs to the seller
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        product: {
          sellerId,
        },
      },
      include: {
        order: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
          },
        },
      },
      orderBy: {
        order: {
          createdAt: 'desc',
        },
      },
    });

    // Group by order and return unique orders with seller's items
    const ordersMap = new Map();

    for (const item of orderItems) {
      if (!ordersMap.has(item.orderId)) {
        ordersMap.set(item.orderId, {
          ...item.order,
          items: [],
        });
      }
      ordersMap.get(item.orderId).items.push(item);
    }

    return Array.from(ordersMap.values());
  }

  /**
   * Find single order by ID
   */
  async findOne(id: number, userId: number, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
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

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Check authorization: buyer, seller of any product, or admin
    const isBuyer = order.buyerId === userId;
    const isSeller = order.items.some((item) => item.product.seller.id === userId);
    const isAdmin = userRole === 'ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  /**
   * Update order status
   */
  async updateStatus(
    updateOrderStatusInput: UpdateOrderStatusInput,
    userId: number,
    userRole: string,
  ) {
    const { orderId, status } = updateOrderStatusInput;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                sellerId: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Authorization: seller of any product in the order or admin
    const isSeller = order.items.some((item) => item.product.sellerId === userId);
    const isAdmin = userRole === 'ADMIN';

    if (!isSeller && !isAdmin) {
      throw new ForbiddenException('Only sellers or admins can update order status');
    }

    // Validate status transitions
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update status of a cancelled order');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot update status of a completed order');
    }

    // Update order status
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

  /**
   * Cancel order (buyer only, only if PENDING)
   */
  async cancel(orderId: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Only buyer can cancel
    if (order.buyerId !== userId) {
      throw new ForbiddenException('Only the buyer can cancel this order');
    }

    // Can only cancel if PENDING
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Can only cancel orders with PENDING status');
    }

    // Cancel order and restore stock in transaction
    return this.prisma.$transaction(async (tx) => {
      // Restore stock for each item
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update order status to CANCELLED
      return tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
    });
  }
  async confirmDelivery(orderId: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    if (order.buyerId !== userId) {
      throw new Error('No tienes permiso para confirmar esta orden');
    }

    if (order.status !== OrderStatus.SHIPPED) {
      throw new Error('Solo se puede confirmar la entrega de órdenes enviadas');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.COMPLETED },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        buyer: true,
      }
    });
  }
}
