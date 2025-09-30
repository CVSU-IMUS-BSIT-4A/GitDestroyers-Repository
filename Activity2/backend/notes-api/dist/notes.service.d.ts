import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
export declare class NotesService {
    private readonly notes;
    constructor(notes: Repository<Note>);
    create(userId: number, dto: CreateNoteDto): Promise<Note>;
    findAll(userId: number): Promise<Note[]>;
    findOne(userId: number, id: number): Promise<Note>;
    update(userId: number, id: number, dto: UpdateNoteDto): Promise<Note>;
    remove(userId: number, id: number): Promise<void>;
}
