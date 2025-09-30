import { Note } from './note.entity';
export declare class User {
    id: number;
    email: string;
    passwordHash: string;
    notes: Note[];
    createdAt: Date;
    updatedAt: Date;
}
