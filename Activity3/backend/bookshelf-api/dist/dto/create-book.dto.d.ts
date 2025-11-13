export declare class CreateBookDto {
    title: string;
    authorId?: number;
    categoryId?: number;
    publishedYear: number;
    isbn: string;
    pageCount: number;
    coverUrl: string;
    plot: string;
}
export declare class UpdateBookDto {
    title?: string;
    authorId?: number | null;
    categoryId?: number | null;
    publishedYear?: number | null;
    isbn?: string | null;
    pageCount?: number | null;
    coverUrl?: string | null;
    plot?: string | null;
}
