import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
export declare class CategoriesService {
    private readonly repo;
    constructor(repo: Repository<Category>);
    create(name: string): Promise<Category>;
    findAll(): Promise<Category[]>;
    findOne(id: number): Promise<Category>;
    update(id: number, name: string): Promise<Category>;
    remove(id: number): Promise<void>;
}
