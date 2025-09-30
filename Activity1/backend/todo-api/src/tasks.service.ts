import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createDto: CreateTaskDto): Promise<Task> {
    const newTask = this.taskRepository.create({
      title: createDto.title,
      description: createDto.description ?? null,
      completed: createDto.completed ?? false,
    });
    return await this.taskRepository.save(newTask);
  }

  async findAll(): Promise<Task[]> {
    return await this.taskRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async update(id: number, updateDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    if (updateDto.title !== undefined) task.title = updateDto.title;
    if (updateDto.description !== undefined) task.description = updateDto.description;
    if (updateDto.completed !== undefined) task.completed = updateDto.completed;
    return await this.taskRepository.save(task);
  }

  async remove(id: number): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Task ${id} not found`);
  }
}
