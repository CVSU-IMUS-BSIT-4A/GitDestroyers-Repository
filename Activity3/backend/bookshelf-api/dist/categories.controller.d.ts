import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesController {
    private readonly service;
    constructor(service: CategoriesService);
    create(dto: CreateCategoryDto): Promise<import("./entities/category.entity").Category>;
    findAll(): Promise<import("./entities/category.entity").Category[]>;
    findOne(id: number): Promise<import("./entities/category.entity").Category>;
    update(id: number, dto: UpdateCategoryDto): Promise<import("./entities/category.entity").Category>;
    remove(id: number): Promise<void>;
}
