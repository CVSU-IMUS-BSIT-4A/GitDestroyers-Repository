import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly repo: Repository<Category>) {}

  create(name: string) { return this.repo.save(this.repo.create({ name })); }
  findAll() { return this.repo.find({ order: { name: 'ASC' } }); }
  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Category not found');
    return item;
  }
  async update(id: number, name: string) {
    const item = await this.findOne(id);
    item.name = name;
    return this.repo.save(item);
  }
  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Category not found');
  }
}
