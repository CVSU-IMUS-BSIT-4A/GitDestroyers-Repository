export declare class UpdateTaskDto {
    title?: string;
    description?: string | null;
    completed?: boolean;
    dueDate?: string | null;
    priority?: 'low' | 'medium' | 'high';
}
