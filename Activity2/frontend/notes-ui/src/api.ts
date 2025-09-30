import axios from 'axios';

export const api = axios.create({ baseURL: 'http://localhost:3002' });

export async function register(email: string, password: string): Promise<string> {
  const { data } = await api.post<{ accessToken: string }>('/auth/register', { email, password });
  return data.accessToken;
}

export async function login(email: string, password: string): Promise<string> {
  const { data } = await api.post<{ accessToken: string }>('/auth/login', { email, password });
  return data.accessToken;
}

export type Note = { id: number; title: string; content?: string | null; createdAt: string; updatedAt: string };

export function setAuth(token: string | null) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export async function fetchNotes(): Promise<Note[]> {
  const { data } = await api.get<Note[]>('/notes');
  return data;
}

export async function createNote(title: string, content?: string) {
  const { data } = await api.post<Note>('/notes', { title, content });
  return data;
}

export async function updateNote(id: number, payload: Partial<Pick<Note, 'title' | 'content'>>) {
  const { data } = await api.patch<Note>(`/notes/${id}`, payload);
  return data;
}

export async function deleteNote(id: number) {
  await api.delete(`/notes/${id}`);
}


