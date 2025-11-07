import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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
