import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';

import { ReviewModule } from '../review/review.module';

@Module({
  imports: [ReviewModule],
  providers: [ProductResolver, ProductService],
})
export class ProductModule { }
