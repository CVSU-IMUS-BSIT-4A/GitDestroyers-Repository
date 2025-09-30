import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
export declare class NotesController {
    private readonly notes;
    constructor(notes: NotesService);
    create(req: any, dto: CreateNoteDto): Promise<import("./entities/note.entity").Note>;
    findAll(req: any): Promise<import("./entities/note.entity").Note[]>;
    findOne(req: any, id: number): Promise<import("./entities/note.entity").Note>;
    update(req: any, id: number, dto: UpdateNoteDto): Promise<import("./entities/note.entity").Note>;
    remove(req: any, id: number): Promise<{
        success: boolean;
    }>;
}
