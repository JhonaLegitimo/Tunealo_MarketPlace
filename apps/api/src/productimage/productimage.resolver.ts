import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductimageService } from './productimage.service';
import { ProductImage } from './entities/productimage.entity';
import { CreateProductimageInput } from './dto/create-productimage.input';
import { UpdateProductimageInput } from './dto/update-productimage.input';

@Resolver(() => ProductImage)
export class ProductimageResolver {
  constructor(private readonly productimageService: ProductimageService) {}

  @Mutation(() => ProductImage)
  createProductimage(@Args('createProductimageInput') createProductimageInput: CreateProductimageInput) {
    return this.productimageService.create(createProductimageInput);
  }

  @Query(() => [ProductImage], { name: 'productimage' })
  findAll() {
    return this.productimageService.findAll();
  }

  @Query(() => ProductImage, { name: 'productimage' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.productimageService.findOne(id);
  }

  @Mutation(() => ProductImage)
  updateProductimage(@Args('updateProductimageInput') updateProductimageInput: UpdateProductimageInput) {
    return this.productimageService.update(updateProductimageInput.id, updateProductimageInput);
  }

  @Mutation(() => ProductImage)
  removeProductimage(@Args('id', { type: () => Int }) id: number) {
    return this.productimageService.remove(id);
  }
}
