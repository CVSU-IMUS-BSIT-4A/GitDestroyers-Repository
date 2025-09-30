import { Book } from './book.entity';
export declare class Author {
    id: number;
    name: string;
    books: Book[];
    createdAt: Date;
    updatedAt: Date;
}
