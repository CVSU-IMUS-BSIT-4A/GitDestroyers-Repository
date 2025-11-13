import { Author } from './author.entity';
import { Category } from './category.entity';
export declare class Book {
    id: number;
    title: string;
    author: Author | null;
    category: Category | null;
    publishedYear: number | null;
    isbn: string | null;
    pageCount: number | null;
    coverUrl: string | null;
    plot: string | null;
    borrowed: boolean;
    borrowedDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
