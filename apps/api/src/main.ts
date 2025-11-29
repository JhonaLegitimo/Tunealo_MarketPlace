import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Helmet middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable for GraphQL Playground
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(o => o.trim()) : 'http://localhost:3000',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global JWT authentication guard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on: http://localhost:${port}/graphql`);
}
bootstrap();
