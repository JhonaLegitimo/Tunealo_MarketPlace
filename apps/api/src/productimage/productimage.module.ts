import { Module } from '@nestjs/common';
import { ProductimageService } from './productimage.service';
import { ProductimageResolver } from './productimage.resolver';

@Module({
  providers: [ProductimageResolver, ProductimageService],
})
export class ProductimageModule {}
