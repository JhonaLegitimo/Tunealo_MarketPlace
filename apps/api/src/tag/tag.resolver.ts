import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './entities/tag.entity';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';

@Resolver(() => Tag)
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagResolver {
  constructor(private readonly tagService: TagService) {}

  // ==================== MUTATIONS ====================

  @Mutation(() => Tag, {
    description: 'Create a new tag/category (ADMIN only)',
  })
  @Roles(Role.ADMIN)
  createTag(@Args('createTagInput') createTagInput: CreateTagInput) {
    return this.tagService.create(createTagInput);
  }

  @Mutation(() => Tag, {
    description: 'Update an existing tag/category (ADMIN only)',
  })
  @Roles(Role.ADMIN)
  updateTag(@Args('updateTagInput') updateTagInput: UpdateTagInput) {
    return this.tagService.update(updateTagInput.id, updateTagInput);
  }

  @Mutation(() => Tag, {
    description: 'Delete a tag/category (ADMIN only)',
  })
  @Roles(Role.ADMIN)
  removeTag(@Args('id', { type: () => Int }) id: number) {
    return this.tagService.remove(id);
  }

  // ==================== QUERIES ====================

  @Query(() => [Tag], {
    name: 'tags',
    description: 'Get all tags/categories (public)',
  })
  @Public()
  findAll() {
    return this.tagService.findAll();
  }

  @Query(() => Tag, {
    name: 'tag',
    description: 'Get a single tag/category by ID (public)',
  })
  @Public()
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.tagService.findOne(id);
  }
}
