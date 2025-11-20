import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { ProductimageModule } from './productimage/productimage.module';
import { TagModule } from './tag/tag.module';
import { OrderModule } from './order/order.module';
import { OrderitemModule } from './orderitem/orderitem.module';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/graphql/schema.gql")
    }),
    PrismaModule,
    ProductModule,
    UserModule,
    ProductimageModule,
    TagModule,
    OrderModule,
    OrderitemModule,
    ReviewModule,
    AuthModule,
    CartModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
