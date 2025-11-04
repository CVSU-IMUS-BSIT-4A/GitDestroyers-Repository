import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) private readonly notes: Repository<Note>,
  ) {}

  async create(userId: number, dto: CreateNoteDto): Promise<Note> {
    const note = this.notes.create({
      title: dto.title,
      content: dto.content ?? null,
      category: dto.category ?? null,
      folder: dto.folder ?? null,
      user: { id: userId } as any,
    });
    return await this.notes.save(note);
  }

  async findAll(userId: number): Promise<Note[]> {
    // only non-deleted notes by default
  return await this.notes.find({ where: { user: { id: userId }, deletedAt: IsNull() }, order: { createdAt: 'DESC' } });
  }

  async findTrashed(userId: number): Promise<Note[]> {
    return await this.notes.find({ where: { user: { id: userId }, deletedAt: Not(IsNull()) }, order: { createdAt: 'DESC' } });
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
    if (dto.category !== undefined) note.category = dto.category;
    if (dto.folder !== undefined) note.folder = dto.folder;
    return await this.notes.save(note);
  }

  async remove(userId: number, id: number): Promise<void> {
    // soft delete: mark deletedAt timestamp
    const note = await this.findOne(userId, id);
    note.deletedAt = new Date();
    await this.notes.save(note);
  }

  async restore(userId: number, id: number): Promise<Note> {
    const note = await this.notes.findOne({ where: { id } , relations: { user: true }});
    if (!note) throw new NotFoundException('Note not found');
    if (note.user.id !== userId) throw new UnauthorizedException();
    note.deletedAt = null;
    return await this.notes.save(note);
  }

  async removePermanent(userId: number, id: number): Promise<void> {
    const note = await this.findOne(userId, id);
    await this.notes.delete(note.id);
  }
}
