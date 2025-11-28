import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { Review } from './entities/review.entity';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@prisma/client';

// GraphQL Type for delete response
@ObjectType()
class DeleteReviewResponse {
  @Field()
  message: string;
}

@Resolver(() => Review)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) { }

  // ==================== MUTATIONS ====================

  @Mutation(() => Review, {
    description: 'Crear una nueva reseña (solo BUYER que haya comprado el producto)',
  })
  @Roles(Role.BUYER, Role.ADMIN, Role.SELLER)
  createReview(
    @Args('createReviewInput') createReviewInput: CreateReviewInput,
    @CurrentUser() user: any,
  ) {
    console.log('ReviewResolver.createReview called', { userId: user.id, input: createReviewInput });
    return this.reviewService.create(user.id, createReviewInput);
  }

  @Mutation(() => Review, {
    description: 'Actualizar una reseña (solo el autor)',
  })
  updateReview(
    @Args('updateReviewInput') updateReviewInput: UpdateReviewInput,
    @CurrentUser() user: any,
  ) {
    return this.reviewService.update(
      user.id,
      updateReviewInput.id,
      updateReviewInput,
    );
  }

  @Mutation(() => DeleteReviewResponse, {
    description: 'Eliminar una reseña (autor o ADMIN)',
  })
  removeReview(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: any,
  ) {
    const isAdmin = user.role === Role.ADMIN;
    return this.reviewService.remove(user.id, id, isAdmin);
  }

  // ==================== QUERIES ====================

  @Query(() => [Review], {
    name: 'reviews',
    description: 'Listar todas las reseñas con filtros opcionales (público)',
  })
  @Public()
  findAll(
    @Args('productId', { type: () => Int, nullable: true }) productId?: number,
    @Args('userId', { type: () => Int, nullable: true }) userId?: number,
    @Args('rating', { type: () => Int, nullable: true }) rating?: number,
  ) {
    return this.reviewService.findAll(productId, userId, rating);
  }

  @Query(() => Review, {
    name: 'review',
    description: 'Obtener una reseña específica (público)',
  })
  @Public()
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.reviewService.findOne(id);
  }
}
