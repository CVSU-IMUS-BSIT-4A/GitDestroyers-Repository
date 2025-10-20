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

export type Note = { id: number; title: string; content?: string | null; category?: string | null; folder?: string | null; createdAt: string; updatedAt: string; deletedAt?: string | null };

export type CurrentUser = { id: number; email: string; createdAt: string };

export function setAuth(token: string | null) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export async function fetchNotes(): Promise<Note[]> {
  const { data } = await api.get<Note[]>('/notes');
  return data;
}

export async function fetchTrashedNotes(): Promise<Note[]> {
  const { data } = await api.get<Note[]>('/notes?trashed=1');
  return data;
}

export async function createNote(title: string, content?: string, category?: string, folder?: string) {
  const { data } = await api.post<Note>('/notes', { title, content, category, folder });
  return data;
}

export async function updateNote(id: number, payload: Partial<Pick<Note, 'title' | 'content' | 'category' | 'folder'>>) {
  const { data } = await api.patch<Note>(`/notes/${id}`, payload);
  return data;
}

export async function deleteNote(id: number) {
  await api.delete(`/notes/${id}`);
}

export async function restoreNote(id: number) {
  const { data } = await api.post<Note>(`/notes/${id}/restore`);
  return data;
}

export async function deleteNotePermanent(id: number) {
  await api.delete(`/notes/${id}/permanent`);
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await api.get<CurrentUser>('/users/me');
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data } = await api.patch('/users/me/password', { currentPassword, newPassword });
  return data;
}


