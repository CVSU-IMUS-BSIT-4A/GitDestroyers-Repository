import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
export declare class BooksService {
    private readonly repo;
    constructor(repo: Repository<Book>);
    create(title: string, authorId?: number, categoryId?: number): Promise<Book>;
    findAll(): Promise<Book[]>;
    findOne(id: number): Promise<Book>;
    update(id: number, payload: {
        title?: string;
        authorId?: number | null;
        categoryId?: number | null;
    }): Promise<Book>;
    remove(id: number): Promise<void>;
}
