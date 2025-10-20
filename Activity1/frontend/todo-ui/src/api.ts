import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  completedAt?: string | null;
  dueDate?: string | null;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
};

export async function fetchTasks(): Promise<Task[]> {
  const { data } = await api.get<Task[]>('/tasks');
  return data;
}

export async function createTask(payload: Partial<Task>): Promise<Task> {
  const { data } = await api.post<Task>('/tasks', payload);
  return data;
}

export async function updateTask(id: number, payload: Partial<Task>): Promise<Task> {
  const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}


