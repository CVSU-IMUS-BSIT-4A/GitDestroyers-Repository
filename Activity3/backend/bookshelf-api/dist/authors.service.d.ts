import { Repository } from 'typeorm';
import { Author } from './entities/author.entity';
export declare class AuthorsService {
    private readonly repo;
    constructor(repo: Repository<Author>);
    create(name: string): Promise<Author>;
    findAll(): Promise<Author[]>;
    findOne(id: number): Promise<Author>;
    update(id: number, name: string): Promise<Author>;
    remove(id: number): Promise<void>;
}
