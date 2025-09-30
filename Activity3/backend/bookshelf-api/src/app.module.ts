import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorsModule } from './authors.module';
import { CategoriesModule } from './categories.module';
import { BooksModule } from './books.module';
import { Author } from './entities/author.entity';
import { Category } from './entities/category.entity';
import { Book } from './entities/book.entity';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'bookshelf.sqlite',
      entities: [Author, Category, Book],
      synchronize: true,
    }),
    AuthorsModule,
    CategoriesModule,
    BooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
