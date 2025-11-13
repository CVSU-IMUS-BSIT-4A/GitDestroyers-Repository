import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: false,
  });
  
  // Increase body size limit to 15MB (to handle base64 encoded images up to 10MB)
  // Base64 encoding increases size by ~33%, so 10MB image becomes ~13MB
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ limit: '15mb', extended: true }));
  
  // Enable CORS
  app.enableCors();

  // Add validation
  app.useGlobalPipes(new ValidationPipe());

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Bookshelf API')
    .setDescription('API documentation for the Bookshelf application')
    .setVersion('1.0')
    .addTag('books')
    .addTag('authors')
    .addTag('categories')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);  // Changed from 'docs' to 'api'

  await app.listen(3003);
}
bootstrap();
