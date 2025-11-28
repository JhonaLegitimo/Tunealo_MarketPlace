import { Resolver, Query, Mutation, Args, Int, Float, Field, ObjectType, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { Review } from '../review/entities/review.entity';
import { ReviewService } from '../review/review.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';

// GraphQL Type for paginated products response
@ObjectType()
class PaginatedProducts {
  @Field(() => [Product])
  products: Product[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;

  @Field(() => Int)
  currentPage: number;
}

@Resolver(() => Product)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly reviewService: ReviewService,
  ) { }

  // ==================== MUTATIONS ====================

  @Mutation(() => Product, {
    description: 'Create a new product (SELLER only)',
  })
  @Roles(Role.SELLER, Role.ADMIN)
  createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
    @CurrentUser() user: any,
  ) {
    return this.productService.create(createProductInput, user.id);
  }

  @Mutation(() => Product, {
    description: 'Update a product (owner or ADMIN only)',
  })
  updateProduct(
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
    @CurrentUser() user: any,
  ) {
    return this.productService.update(
      updateProductInput.id,
      updateProductInput,
      user.id,
      user.role,
    );
  }

  @Mutation(() => Product, {
    description: 'Delete a product (owner or ADMIN only)',
  })
  deleteProduct(@Args('id', { type: () => Int }) id: number, @CurrentUser() user: any) {
    return this.productService.remove(id, user.id, user.role);
  }

  // ==================== QUERIES ====================

  @Query(() => PaginatedProducts, {
    name: 'products',
    description: 'Get all products with optional filters and pagination (public)',
  })
  @Public()
  findAll(
    @Args('searchTerm', { type: () => String, nullable: true }) searchTerm?: string,
    @Args('priceMin', { type: () => Float, nullable: true }) priceMin?: number,
    @Args('priceMax', { type: () => Float, nullable: true }) priceMax?: number,
    @Args('categoryIds', { type: () => [Int], nullable: true }) categoryIds?: number[],
    @Args('sellerId', { type: () => Int, nullable: true }) sellerId?: number,
    @Args('published', { type: () => Boolean, nullable: true }) published?: boolean,
    @Args('inStock', { type: () => Boolean, nullable: true }) inStock?: boolean,
    @Args('orderBy', {
      type: () => String,
      nullable: true,
      description: 'newest | oldest | priceAsc | priceDesc | bestRating',
    })
    orderBy?: string,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 }) skip?: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 20 }) take?: number,
  ) {
    return this.productService.findAll({
      searchTerm,
      priceMin,
      priceMax,
      categoryIds,
      sellerId,
      published,
      inStock,
      orderBy: orderBy as any,
      skip,
      take,
    });
  }

  @Query(() => Product, {
    name: 'product',
    description: 'Get a single product by ID (public)',
  })
  @Public()
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.productService.findOne(id);
  }

  @Query(() => Product, {
    name: 'productBySlug',
    description: 'Get a single product by slug (public)',
  })
  @Public()
  findBySlug(@Args('slug', { type: () => String }) slug: string) {
    return this.productService.findBySlug(slug);
  }

  @ResolveField(() => [Review], { name: 'reviews', nullable: true })
  async getReviews(@Parent() product: Product) {
    const { id } = product;
    console.log(`ProductResolver.getReviews called for product ${id} (type: ${typeof id})`);
    return this.reviewService.findAll(id);
  }
}
