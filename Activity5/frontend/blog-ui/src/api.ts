import axios from 'axios';

export const api = axios.create({ baseURL: 'http://localhost:3005' });

export type LoginResponse = { accessToken: string };
export type UserRef = { id: number; name?: string; email?: string };
export type Comment = { id: number; text: string; author?: UserRef | null };
export type Post = { id: number; title: string; content: string; author?: UserRef | null; comments?: Comment[] };

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('a5_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('a5_token');
  }
}

export function loadTokenFromStorage() {
  const t = localStorage.getItem('a5_token');
  if (t) setAuthToken(t);
}

export function getCurrentUserIdFromToken(): number | null {
  const t = localStorage.getItem('a5_token');
  if (!t) return null;
  try {
    const [, payloadB64] = t.split('.');
    const json = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    const sub = Number(json?.sub);
    return Number.isFinite(sub) ? sub : null;
  } catch {
    return null;
  }
}

export async function register(email: string, name: string, password: string) {
  return api.post('/auth/register', { email, name, password });
}

export async function login(email: string, password: string) {
  const res = await api.post<LoginResponse>('/auth/login', { email, password });
  return res.data;
}

export async function listPosts(page = 1, pageSize = 10) {
  const res = await api.get(`/posts`, { params: { page, pageSize } });
  const payload = res.data;
  if (Array.isArray(payload)) {
    return { data: payload as Post[], total: payload.length, page, pageSize };
  }
  if (payload && Array.isArray(payload.data)) {
    return payload as { data: Post[]; total: number; page: number; pageSize: number };
  }
  return { data: [], total: 0, page, pageSize };
}

export async function createPost(title: string, content: string) {
  const res = await api.post<Post>('/posts', { title, content });
  return res.data;
}

export async function addComment(postId: number, text: string) {
  const res = await api.post<Comment>('/comments', { postId, text });
  return res.data;
}

export async function updatePost(id: number, data: Partial<Pick<Post, 'title' | 'content'>>) {
  const res = await api.patch<Post>(`/posts/${id}`, data);
  return res.data;
}

export async function deletePost(id: number) {
  const res = await api.delete<{ deleted: boolean }>(`/posts/${id}`);
  return res.data;
}

export async function updateComment(id: number, data: Partial<{ text: string }>) {
  const res = await api.patch<Comment>(`/comments/${id}`, data);
  return res.data;
}

export async function deleteComment(id: number) {
  const res = await api.delete<{ deleted: boolean }>(`/comments/${id}`);
  return res.data;
}

export async function getUser(id: number) {
  const res = await api.get<UserRef>(`/users/${id}`);
  return res.data;
}

export async function updateUser(id: number, data: Partial<{ name: string; email: string; password: string }>) {
  const res = await api.patch<UserRef>(`/users/${id}`, data);
  return res.data;
}

export async function deleteUser(id: number) {
  const res = await api.delete<{ deleted: boolean }>(`/users/${id}`);
  return res.data;
}
