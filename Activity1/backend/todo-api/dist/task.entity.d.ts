export declare class Task {
    id: number;
    title: string;
    description?: string | null;
    completed: boolean;
    completedAt?: Date | null;
    dueDate?: Date | null;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
}
