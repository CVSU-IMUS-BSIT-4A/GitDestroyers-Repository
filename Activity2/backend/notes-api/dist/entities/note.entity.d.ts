import { User } from './user.entity';
export declare class Note {
    id: number;
    title: string;
    content?: string | null;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
