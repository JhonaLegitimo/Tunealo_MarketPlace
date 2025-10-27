import { Injectable } from '@nestjs/common';
import { CreateProductimageInput } from './dto/create-productimage.input';
import { UpdateProductimageInput } from './dto/update-productimage.input';

@Injectable()
export class ProductimageService {
  create(createProductimageInput: CreateProductimageInput) {
    return 'This action adds a new productimage';
  }

  findAll() {
    return `This action returns all productimage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productimage`;
  }

  update(id: number, updateProductimageInput: UpdateProductimageInput) {
    return `This action updates a #${id} productimage`;
  }

  remove(id: number) {
    return `This action removes a #${id} productimage`;
  }
}
