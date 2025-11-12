import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { PrismaService } from 'src/prisma/prisma.service';

interface SearchFilters {
  searchTerm?: string;
  priceMin?: number;
  priceMax?: number;
  categoryIds?: number[];
  sellerId?: number;
  published?: boolean;
  inStock?: boolean;
  orderBy?: 'newest' | 'oldest' | 'priceAsc' | 'priceDesc' | 'bestRating';
  skip?: number;
  take?: number;
}

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a unique slug from title
   */
  private async generateUniqueSlug(title: string, excludeId?: number): Promise<string> {
    // Convert to lowercase and replace spaces with hyphens
    let baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    // Check if slug exists
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.product.findFirst({
        where: {
          slug,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });

      if (!existing) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Create a new product (SELLER only)
   */
  async create(createProductInput: CreateProductInput, sellerId: number) {
    // Generate unique slug
    const slug = await this.generateUniqueSlug(createProductInput.title);

    // Validate category IDs exist
    if (createProductInput.categoryIds && createProductInput.categoryIds.length > 0) {
      const categories = await this.prisma.tag.findMany({
        where: { id: { in: createProductInput.categoryIds } },
      });

      if (categories.length !== createProductInput.categoryIds.length) {
        throw new BadRequestException('One or more category IDs are invalid');
      }
    }

    // Create product with relations
    return this.prisma.product.create({
      data: {
        title: createProductInput.title,
        slug,
        description: createProductInput.description,
        price: createProductInput.price,
        stock: createProductInput.stock,
        published: createProductInput.published ?? false,
        sellerId,
        // Connect categories (many-to-many)
        categories: createProductInput.categoryIds
          ? {
              connect: createProductInput.categoryIds.map((id) => ({ id })),
            }
          : undefined,
        // Create images
        images: createProductInput.imageUrls
          ? {
              create: createProductInput.imageUrls.map((url) => ({ url })),
            }
          : undefined,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        categories: true,
        images: true,
      },
    });
  }

  /**
   * Find all products with optional filters
   */
  async findAll(filters?: SearchFilters) {
    const {
      searchTerm,
      priceMin,
      priceMax,
      categoryIds,
      sellerId,
      published,
      inStock,
      orderBy = 'newest',
      skip = 0,
      take = 20,
    } = filters || {};

    // Build where clause
    const where: any = {};

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) where.price.gte = priceMin;
      if (priceMax !== undefined) where.price.lte = priceMax;
    }

    if (categoryIds && categoryIds.length > 0) {
      where.categories = {
        some: {
          id: { in: categoryIds },
        },
      };
    }

    if (sellerId !== undefined) {
      where.sellerId = sellerId;
    }

    if (published !== undefined) {
      where.published = published;
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    // Build orderBy clause
    let orderByClause: any = {};
    switch (orderBy) {
      case 'newest':
        orderByClause = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderByClause = { createdAt: 'asc' };
        break;
      case 'priceAsc':
        orderByClause = { price: 'asc' };
        break;
      case 'priceDesc':
        orderByClause = { price: 'desc' };
        break;
      case 'bestRating':
        // Note: For rating, we'd need to calculate average from reviews
        // For now, default to newest
        orderByClause = { createdAt: 'desc' };
        break;
      default:
        orderByClause = { createdAt: 'desc' };
    }

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: orderByClause,
        skip,
        take: Math.min(take, 100), // Max 100 per page
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
          categories: true,
          images: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      totalCount,
      hasMore: skip + products.length < totalCount,
      currentPage: Math.floor(skip / take) + 1,
    };
  }

  /**
   * Find product by ID
   */
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        categories: true,
        images: true,
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Find product by slug
   */
  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        categories: true,
        images: true,
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return product;
  }

  /**
   * Update product (owner only)
   */
  async update(
    id: number,
    updateProductInput: UpdateProductInput,
    userId: number,
    userRole: string,
  ) {
    // Check if product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: { seller: true },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check ownership (only seller or admin can update)
    if (existingProduct.sellerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own products');
    }

    // Generate new slug if title changed
    let slug = existingProduct.slug;
    if (updateProductInput.title && updateProductInput.title !== existingProduct.title) {
      slug = await this.generateUniqueSlug(updateProductInput.title, id);
    }

    // Validate category IDs if provided
    if (updateProductInput.categoryIds && updateProductInput.categoryIds.length > 0) {
      const categories = await this.prisma.tag.findMany({
        where: { id: { in: updateProductInput.categoryIds } },
      });

      if (categories.length !== updateProductInput.categoryIds.length) {
        throw new BadRequestException('One or more category IDs are invalid');
      }
    }

    // Prepare update data
    const updateData: any = {
      ...(updateProductInput.title && { title: updateProductInput.title }),
      ...(slug !== existingProduct.slug && { slug }),
      ...(updateProductInput.description && { description: updateProductInput.description }),
      ...(updateProductInput.price !== undefined && { price: updateProductInput.price }),
      ...(updateProductInput.stock !== undefined && { stock: updateProductInput.stock }),
      ...(updateProductInput.published !== undefined && { published: updateProductInput.published }),
    };

    // Handle category updates
    if (updateProductInput.categoryIds) {
      updateData.categories = {
        set: [], // Disconnect all
        connect: updateProductInput.categoryIds.map((id) => ({ id })), // Connect new ones
      };
    }

    // Handle image updates
    if (updateProductInput.imageUrls) {
      // Delete existing images and create new ones
      updateData.images = {
        deleteMany: {},
        create: updateProductInput.imageUrls.map((url) => ({ url })),
      };
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        categories: true,
        images: true,
      },
    });
  }

  /**
   * Delete product (owner or admin only)
   */
  async remove(id: number, userId: number, userRole: string) {
    // Check if product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check ownership
    if (existingProduct.sellerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own products');
    }

    // Optional: Prevent deletion if product has orders
    // Uncomment if you want this behavior
    // if (existingProduct._count.OrderItems > 0) {
    //   throw new BadRequestException(
    //     'Cannot delete product that has been ordered. Consider unpublishing it instead.',
    //   );
    // }

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      id: existingProduct.id,
      title: existingProduct.title,
      message: 'Product deleted successfully',
    };
  }
}
