import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) private readonly notes: Repository<Note>,
  ) {}

  async create(userId: number, dto: CreateNoteDto): Promise<Note> {
    const note = this.notes.create({ title: dto.title, content: dto.content ?? null, user: { id: userId } as any });
    return await this.notes.save(note);
  }

  async findAll(userId: number): Promise<Note[]> {
    return await this.notes.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  async findOne(userId: number, id: number): Promise<Note> {
    const note = await this.notes.findOne({ where: { id }, relations: { user: true } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.user.id !== userId) throw new UnauthorizedException();
    return note;
  }

  async update(userId: number, id: number, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(userId, id);
    if (dto.title !== undefined) note.title = dto.title;
    if (dto.content !== undefined) note.content = dto.content;
    return await this.notes.save(note);
  }

  async remove(userId: number, id: number): Promise<void> {
    const note = await this.findOne(userId, id);
    await this.notes.delete(note.id);
  }
}
