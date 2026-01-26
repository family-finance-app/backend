import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiHttpExceptionFilter } from './common/filters/api-http-exception.filter.js';
import { buildGlobalValidationPipe } from './common/pipes/global-validation.pipe.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://dev.familyfinance.site',
        'https://familyfinance.site',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    allowedHeaders: ['Cookie', 'Authorization', 'Content-Type', 'Accept'],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
  });

  const config = new DocumentBuilder()
    .setTitle('Family Finance API')
    .setDescription('API docs for the backend services')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'accessToken',
        description:
          'To get an access token it is necessary to pass the authentification through /auth/signup endpoint',
        in: 'header',
      },
      'accessToken',
    )

    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.use(cookieParser());

  app.useGlobalPipes(buildGlobalValidationPipe());

  app.useGlobalFilters(new ApiHttpExceptionFilter());

  const port = process.env.PORT || 3000;
  const nodeEnv = process.env.NODE_ENV || 'development';

  await app.listen(port);

  console.log(`Family Finance Backend`);
  console.log(`Environment: ${nodeEnv}`);
  console.log(`Running on: http://localhost:${port}`);
  console.log(`API endpoints: http://localhost:${port}/\n`);
}

bootstrap();
