import { Module } from '@nestjs/common';
import { OrderitemService } from './orderitem.service';
import { OrderitemResolver } from './orderitem.resolver';

@Module({
  providers: [OrderitemResolver, OrderitemService],
})
export class OrderitemModule {}
