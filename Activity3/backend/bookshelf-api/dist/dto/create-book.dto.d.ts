export declare class CreateBookDto {
    title: string;
    authorId?: number;
    categoryId?: number;
}
export declare class UpdateBookDto {
    title?: string;
    authorId?: number | null;
    categoryId?: number | null;
}
