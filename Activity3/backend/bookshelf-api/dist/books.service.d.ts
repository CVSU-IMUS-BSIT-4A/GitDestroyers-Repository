import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
export declare class BooksService {
    private readonly repo;
    constructor(repo: Repository<Book>);
    create(payload: {
        title: string;
        authorId?: number;
        categoryId?: number;
        publishedYear: number;
        isbn: string;
        pageCount: number;
        coverUrl: string;
        plot: string;
    }): Promise<Book>;
    findAll(): Promise<Book[]>;
    findOne(id: number): Promise<Book>;
    update(id: number, payload: {
        title?: string;
        authorId?: number | null;
        categoryId?: number | null;
        publishedYear?: number | null;
        isbn?: string | null;
        pageCount?: number | null;
        coverUrl?: string | null;
        plot?: string | null;
    }): Promise<Book>;
    borrow(id: number): Promise<Book>;
    return(id: number): Promise<Book>;
    remove(id: number): Promise<void>;
}
