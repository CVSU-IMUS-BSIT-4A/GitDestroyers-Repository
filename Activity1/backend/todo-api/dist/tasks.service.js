"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./task.entity");
let TasksService = class TasksService {
    taskRepository;
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }
    async create(createDto) {
        const newTask = this.taskRepository.create({
            title: createDto.title,
            description: createDto.description ?? null,
            completed: createDto.completed ?? false,
            completedAt: createDto.completed ? new Date() : null,
            dueDate: createDto.dueDate ? new Date(createDto.dueDate) : null,
            priority: createDto.priority ?? 'medium',
        });
        return await this.taskRepository.save(newTask);
    }
    async findAll() {
        return await this.taskRepository.find({ order: { createdAt: 'DESC' } });
    }
    async findOne(id) {
        const task = await this.taskRepository.findOne({ where: { id } });
        if (!task)
            throw new common_1.NotFoundException(`Task ${id} not found`);
        return task;
    }
    async update(id, updateDto) {
        const task = await this.findOne(id);
        if (updateDto.title !== undefined)
            task.title = updateDto.title;
        if (updateDto.description !== undefined)
            task.description = updateDto.description;
        if (updateDto.completed !== undefined) {
            task.completed = updateDto.completed;
            task.completedAt = updateDto.completed ? new Date() : null;
        }
        if (updateDto.dueDate !== undefined)
            task.dueDate = updateDto.dueDate ? new Date(updateDto.dueDate) : null;
        if (updateDto.priority !== undefined)
            task.priority = updateDto.priority;
        return await this.taskRepository.save(task);
    }
    async remove(id) {
        const result = await this.taskRepository.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException(`Task ${id} not found`);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map