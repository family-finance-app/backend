import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // removes properties that are not present in DTO
      forbidNonWhitelisted: false, // DOES NOT throw error for excess fields
      transform: true, // automatically transforms types
    })
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  const nodeEnv = process.env.NODE_ENV || 'development';
  await app.listen(port);

  console.log(`Family Finance Backend`);
  console.log(`Environment: ${nodeEnv}`);
  // console.log(`Running on: http://localhost:${port}`);
  console.log(`API endpoints: http://localhost:${port}/api\n`);
}

bootstrap();
