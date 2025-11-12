import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTagInput: CreateTagInput) {
    // Check if tag with same name already exists
    const existingTag = await this.prisma.tag.findFirst({
      where: { name: createTagInput.name },
    });

    if (existingTag) {
      throw new BadRequestException(`Tag with name "${createTagInput.name}" already exists`);
    }

    return this.prisma.tag.create({
      data: {
        name: createTagInput.name,
      },
      include: {
        products: true,
      },
    });
  }

  async findAll() {
    return this.prisma.tag.findMany({
      include: {
        products: {
          where: {
            published: true, // Only include published products
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        products: {
          where: {
            published: true, // Only include published products
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  async update(id: number, updateTagInput: UpdateTagInput) {
    // Check if tag exists
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    // If updating name, check if another tag with that name exists
    if (updateTagInput.name && updateTagInput.name !== existingTag.name) {
      const duplicateTag = await this.prisma.tag.findFirst({
        where: {
          name: updateTagInput.name,
          id: { not: id },
        },
      });

      if (duplicateTag) {
        throw new BadRequestException(`Tag with name "${updateTagInput.name}" already exists`);
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data: {
        name: updateTagInput.name,
      },
      include: {
        products: true,
      },
    });
  }

  async remove(id: number) {
    // Check if tag exists
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existingTag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    // Optional: Prevent deletion if tag has associated products
    // Uncomment if you want this behavior
    // if (existingTag._count.products > 0) {
    //   throw new BadRequestException(
    //     `Cannot delete tag "${existingTag.name}" because it has ${existingTag._count.products} associated products`,
    //   );
    // }

    await this.prisma.tag.delete({
      where: { id },
    });

    return {
      id: existingTag.id,
      name: existingTag.name,
      message: 'Tag deleted successfully',
    };
  }
}
