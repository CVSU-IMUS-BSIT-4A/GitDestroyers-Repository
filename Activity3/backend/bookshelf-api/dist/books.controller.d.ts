import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto } from './dto/create-book.dto';
export declare class BooksController {
    private readonly service;
    constructor(service: BooksService);
    create(dto: CreateBookDto): Promise<import("./entities/book.entity").Book>;
    findAll(): Promise<import("./entities/book.entity").Book[]>;
    findOne(id: number): Promise<import("./entities/book.entity").Book>;
    update(id: number, dto: UpdateBookDto): Promise<import("./entities/book.entity").Book>;
    remove(id: number): Promise<void>;
}
