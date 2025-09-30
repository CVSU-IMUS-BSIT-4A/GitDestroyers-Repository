import { Author } from './author.entity';
import { Category } from './category.entity';
export declare class Book {
    id: number;
    title: string;
    author: Author | null;
    category: Category | null;
    createdAt: Date;
    updatedAt: Date;
}
