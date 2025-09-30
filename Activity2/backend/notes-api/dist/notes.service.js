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
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const note_entity_1 = require("./entities/note.entity");
let NotesService = class NotesService {
    notes;
    constructor(notes) {
        this.notes = notes;
    }
    async create(userId, dto) {
        const note = this.notes.create({ title: dto.title, content: dto.content ?? null, user: { id: userId } });
        return await this.notes.save(note);
    }
    async findAll(userId) {
        return await this.notes.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
    }
    async findOne(userId, id) {
        const note = await this.notes.findOne({ where: { id }, relations: { user: true } });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        if (note.user.id !== userId)
            throw new common_1.UnauthorizedException();
        return note;
    }
    async update(userId, id, dto) {
        const note = await this.findOne(userId, id);
        if (dto.title !== undefined)
            note.title = dto.title;
        if (dto.content !== undefined)
            note.content = dto.content;
        return await this.notes.save(note);
    }
    async remove(userId, id) {
        const note = await this.findOne(userId, id);
        await this.notes.delete(note.id);
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(note_entity_1.Note)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotesService);
//# sourceMappingURL=notes.service.js.map