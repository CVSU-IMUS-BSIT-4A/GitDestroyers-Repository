import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(@InjectRepository(Book) private readonly repo: Repository<Book>) {}

  create(title: string, authorId?: number, categoryId?: number) {
    const book = this.repo.create({ title, author: authorId ? ({ id: authorId } as any) : null, category: categoryId ? ({ id: categoryId } as any) : null });
    return this.repo.save(book);
  }
  findAll() { return this.repo.find({ relations: { author: true, category: true }, order: { createdAt: 'DESC' } }); }
  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id }, relations: { author: true, category: true } });
    if (!item) throw new NotFoundException('Book not found');
    return item;
  }
  async update(id: number, payload: { title?: string; authorId?: number | null; categoryId?: number | null }) {
    const book = await this.findOne(id);
    if (payload.title !== undefined) book.title = payload.title;
    if (payload.authorId !== undefined) book.author = payload.authorId ? ({ id: payload.authorId } as any) : null;
    if (payload.categoryId !== undefined) book.category = payload.categoryId ? ({ id: payload.categoryId } as any) : null;
    return this.repo.save(book);
  }
  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Book not found');
  }
}
