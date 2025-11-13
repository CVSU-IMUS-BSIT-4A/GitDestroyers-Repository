import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(@InjectRepository(Book) private readonly repo: Repository<Book>) {}

  create(payload: {
    title: string;
    authorId?: number;
    categoryId?: number;
    publishedYear: number;
    isbn: string;
    pageCount: number;
    coverUrl: string;
    plot: string;
  }) {
    const book = this.repo.create({
      title: payload.title,
      author: payload.authorId ? ({ id: payload.authorId } as any) : null,
      category: payload.categoryId ? ({ id: payload.categoryId } as any) : null,
      publishedYear: payload.publishedYear,
      isbn: payload.isbn,
      pageCount: payload.pageCount,
      coverUrl: payload.coverUrl,
      plot: payload.plot,
      borrowed: false,
      borrowedDate: null,
    });
    return this.repo.save(book);
  }

  findAll() {
    return this.repo.find({ relations: { author: true, category: true }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id }, relations: { author: true, category: true } });
    if (!item) throw new NotFoundException('Book not found');
    return item;
  }

  async update(id: number, payload: {
    title?: string;
    authorId?: number | null;
    categoryId?: number | null;
    publishedYear?: number | null;
    isbn?: string | null;
    pageCount?: number | null;
    coverUrl?: string | null;
    plot?: string | null;
  }) {
    const book = await this.findOne(id);
    if (payload.title !== undefined) book.title = payload.title;
    if (payload.authorId !== undefined) book.author = payload.authorId ? ({ id: payload.authorId } as any) : null;
    if (payload.categoryId !== undefined) book.category = payload.categoryId ? ({ id: payload.categoryId } as any) : null;
    if (payload.publishedYear !== undefined) book.publishedYear = payload.publishedYear;
    if (payload.isbn !== undefined) book.isbn = payload.isbn;
    if (payload.pageCount !== undefined) book.pageCount = payload.pageCount;
    if (payload.coverUrl !== undefined) book.coverUrl = payload.coverUrl;
    if (payload.plot !== undefined) book.plot = payload.plot;
    return this.repo.save(book);
  }

  async borrow(id: number) {
    const book = await this.findOne(id);
    book.borrowed = true;
    book.borrowedDate = new Date();
    return this.repo.save(book);
  }

  async return(id: number) {
    const book = await this.findOne(id);
    book.borrowed = false;
    book.borrowedDate = null;
    return this.repo.save(book);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Book not found');
  }
}
