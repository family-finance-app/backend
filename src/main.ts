import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parser middleware
  app.use(cookieParser());

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(
    `🚀 Family Finance Backend is running on: http://localhost:${port}`
  );
  console.log(`📚 API endpoints: http://localhost:${port}/api`);
}

bootstrap();
