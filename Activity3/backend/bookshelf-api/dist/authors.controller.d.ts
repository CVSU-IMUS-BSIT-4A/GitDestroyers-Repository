import { AuthorsService } from './authors.service';
import { CreateAuthorDto, UpdateAuthorDto } from './dto/create-author.dto';
export declare class AuthorsController {
    private readonly service;
    constructor(service: AuthorsService);
    create(dto: CreateAuthorDto): Promise<import("./entities/author.entity").Author>;
    findAll(): Promise<import("./entities/author.entity").Author[]>;
    findOne(id: number): Promise<import("./entities/author.entity").Author>;
    update(id: number, dto: UpdateAuthorDto): Promise<import("./entities/author.entity").Author>;
    remove(id: number): Promise<void>;
}
