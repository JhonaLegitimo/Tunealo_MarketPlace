import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Crear una nueva reseña
   * Validaciones:
   * - El producto debe existir
   * - El usuario debe haber comprado el producto (verificar en OrderItem)
   * - El usuario no debe tener ya una reseña para ese producto
   */
  async create(userId: number, createReviewInput: CreateReviewInput) {
    console.log('ReviewService.create called', { userId, createReviewInput });
    const { productId, content, rating, isAnonymous } = createReviewInput;

    // Verificar que el producto existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      console.log('Product not found', productId);
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar que el usuario ha comprado el producto
    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          buyerId: userId,
          status: 'COMPLETED', // Solo órdenes completadas
        },
      },
    });

    console.log('Has purchased check:', { productId, userId, hasPurchased });

    if (!hasPurchased) {
      console.log('User has not purchased product or order not completed');
      throw new ForbiddenException(
        'Solo puedes reseñar productos que hayas comprado',
      );
    }

    // Verificar que no existe ya una reseña del usuario para este producto
    const existingReview = await this.prisma.review.findFirst({
      where: {
        authorId: userId,
        productId,
      },
    });

    if (existingReview) {
      console.log('Review already exists for user', userId, 'product', productId);
      console.log('Existing review object:', JSON.stringify(existingReview, null, 2));
      throw new BadRequestException(
        'Ya has creado una reseña para este producto',
      );
    }

    // Crear la reseña en una transacción
    const review = await this.prisma.$transaction(async (tx) => {
      // Crear la reseña
      const newReview = await tx.review.create({
        data: {
          content,
          rating,
          productId,
          authorId: userId,
          isAnonymous: isAnonymous || false,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });

      // Recalcular el promedio de calificaciones del producto
      await this.recalculateProductRating(tx, productId);

      return newReview;
    });

    console.log('Review created successfully', review);

    return review;
  }

  /**
   * Listar todas las reseñas con filtros opcionales
   */
  async findAll(productId?: number, userId?: number, rating?: number) {
    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (userId) {
      where.authorId = userId;
    }

    if (rating) {
      where.rating = rating;
    }

    const reviews = await this.prisma.review.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log(`ReviewService.findAll for productId ${productId} found ${reviews.length} reviews`);
    return reviews;
  }

  /**
   * Obtener una reseña específica
   */
  async findOne(id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            avgRating: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }

    return review;
  }

  /**
   * Actualizar una reseña
   * Solo el autor puede actualizar su propia reseña
   */
  async update(
    userId: number,
    id: number,
    updateReviewInput: UpdateReviewInput,
  ) {
    // Verificar que la reseña existe
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }

    // Verificar que el usuario es el autor
    if (review.authorId !== userId) {
      throw new ForbiddenException('Solo puedes actualizar tus propias reseñas');
    }

    // Actualizar la reseña en una transacción
    const updatedReview = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id },
        data: {
          content: updateReviewInput.content,
          rating: updateReviewInput.rating,
          isAnonymous: updateReviewInput.isAnonymous,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });

      // Si se actualizó el rating, recalcular el promedio
      if (updateReviewInput.rating !== undefined) {
        await this.recalculateProductRating(tx, review.productId);
      }

      return updated;
    });

    return updatedReview;
  }

  /**
   * Eliminar una reseña
   * Solo el autor o un admin puede eliminar
   */
  async remove(userId: number, reviewId: number, isAdmin: boolean = false) {
    // Verificar que la reseña existe
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }

    // Verificar autorización: debe ser el autor o un admin
    if (!isAdmin && review.authorId !== userId) {
      throw new ForbiddenException(
        'Solo puedes eliminar tus propias reseñas',
      );
    }

    // Eliminar la reseña en una transacción
    await this.prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: reviewId },
      });

      // Recalcular el promedio de calificaciones del producto
      await this.recalculateProductRating(tx, review.productId);
    });

    return { message: 'Reseña eliminada exitosamente' };
  }

  /**
   * Recalcular el promedio de calificaciones de un producto
   * @private método privado usado internamente en transacciones
   */
  private async recalculateProductRating(tx: any, productId: number) {
    // Obtener todas las reseñas del producto
    const reviews = await tx.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    // Calcular el promedio
    let avgRating: number | null = null;

    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      avgRating = sum / reviews.length;
      // Redondear a 2 decimales
      avgRating = Math.round(avgRating * 100) / 100;
    }

    // Actualizar el producto con el nuevo promedio
    await tx.product.update({
      where: { id: productId },
      data: { avgRating },
    });

    return avgRating;
  }
}
