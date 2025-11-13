import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto } from './dto/create-book.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly service: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  create(@Body() dto: CreateBookDto) {
    return this.service.create({
      title: dto.title,
      authorId: dto.authorId,
      categoryId: dto.categoryId,
      publishedYear: dto.publishedYear,
      isbn: dto.isbn,
      pageCount: dto.pageCount,
      coverUrl: dto.coverUrl,
      plot: dto.plot,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all books' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a book' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookDto) {
    return this.service.update(id, {
      title: dto.title,
      authorId: dto.authorId,
      categoryId: dto.categoryId,
      publishedYear: dto.publishedYear,
      isbn: dto.isbn,
      pageCount: dto.pageCount,
      coverUrl: dto.coverUrl,
      plot: dto.plot,
    });
  }

  @Post(':id/borrow')
  @ApiOperation({ summary: 'Borrow a book' })
  borrow(@Param('id', ParseIntPipe) id: number) {
    return this.service.borrow(id);
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Return a borrowed book' })
  returnBook(@Param('id', ParseIntPipe) id: number) {
    return this.service.return(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
