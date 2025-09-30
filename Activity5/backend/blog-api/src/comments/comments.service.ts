import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly repo: Repository<Comment>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async findAll(page = 1, pageSize = 10) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['author', 'post'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: 'DESC' },
    });
    return { data, total, page, pageSize };
  }

  async findOne(id: number) {
    const comment = await this.repo.findOne({ where: { id }, relations: ['author', 'post'] });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async create(data: { text: string; postId: number }, authorId: number) {
    const author = await this.users.findOne({ where: { id: authorId } });
    const comment = this.repo.create({ text: data.text, post: { id: data.postId } as any, author: author || null });
    const saved = await this.repo.save(comment);
    return this.findOne(saved.id);
  }

  async update(id: number, data: Partial<{ text: string }>, userId: number) {
    const existing = await this.repo.findOne({ where: { id }, relations: ['author'] });
    if (!existing) throw new NotFoundException('Comment not found');
    if (existing.author && existing.author.id !== userId) throw new ForbiddenException('Not your comment');
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const existing = await this.repo.findOne({ where: { id }, relations: ['author'] });
    if (!existing) throw new NotFoundException('Comment not found');
    if (existing.author && existing.author.id !== userId) throw new ForbiddenException('Not your comment');
    await this.repo.delete(id);
    return { deleted: true };
  }
}


