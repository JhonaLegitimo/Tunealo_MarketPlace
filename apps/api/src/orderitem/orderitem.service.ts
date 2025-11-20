import { Injectable } from '@nestjs/common';
import { CreateOrderitemInput } from './dto/create-orderitem.input';
import { UpdateOrderitemInput } from './dto/update-orderitem.input';

@Injectable()
export class OrderitemService {
  create(createOrderitemInput: CreateOrderitemInput) {
    return 'This action adds a new orderitem';
  }

  findAll() {
    return `This action returns all orderitem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orderitem`;
  }

  update(id: number, updateOrderitemInput: UpdateOrderitemInput) {
    return `This action updates a #${id} orderitem`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderitem`;
  }
}
