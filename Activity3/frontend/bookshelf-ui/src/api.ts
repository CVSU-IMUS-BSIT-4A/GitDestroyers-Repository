import axios from 'axios';

export const api = axios.create({ baseURL: 'http://localhost:3003' });

export type Author = { id: number; name: string; createdAt?: string; updatedAt?: string };
export type Category = { id: number; name: string; createdAt?: string; updatedAt?: string };
export type Book = {
  id: number;
  title: string;
  author?: Author | null;
  category?: Category | null;
  publishedYear?: number | null;
  isbn?: string | null;
  pageCount?: number | null;
  coverUrl?: string | null;
  plot?: string | null;
  borrowed?: boolean;
  borrowedDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// Authors
export const listAuthors = async () => (await api.get<Author[]>('/authors')).data;
export const createAuthor = async (name: string) => (await api.post<Author>('/authors', { name })).data;
export const updateAuthor = async (id: number, name: string) => (await api.patch<Author>(`/authors/${id}`, { name })).data;
export const deleteAuthor = async (id: number) => { await api.delete(`/authors/${id}`); };

// Categories
export const listCategories = async () => (await api.get<Category[]>('/categories')).data;
export const createCategory = async (name: string) => (await api.post<Category>('/categories', { name })).data;
export const updateCategory = async (id: number, name: string) => (await api.patch<Category>(`/categories/${id}`, { name })).data;
export const deleteCategory = async (id: number) => { await api.delete(`/categories/${id}`); };

// Books
export const listBooks = async () => (await api.get<Book[]>('/books')).data;
export const getBook = async (id: number) => (await api.get<Book>(`/books/${id}`)).data;
export const createBook = async (payload: {
  title: string;
  authorId?: number;
  categoryId?: number;
  publishedYear: number;
  isbn: string;
  pageCount: number;
  coverUrl: string;
  plot: string;
}) => (await api.post<Book>('/books', payload)).data;
export const updateBook = async (id: number, payload: {
  title?: string;
  authorId?: number | null;
  categoryId?: number | null;
  publishedYear?: number | null;
  isbn?: string | null;
  pageCount?: number | null;
  coverUrl?: string | null;
  plot?: string | null;
}) => (await api.patch<Book>(`/books/${id}`, payload)).data;
export const deleteBook = async (id: number) => { await api.delete(`/books/${id}`); };
export const borrowBook = async (id: number) => (await api.post<Book>(`/books/${id}/borrow`)).data;
export const returnBook = async (id: number) => (await api.post<Book>(`/books/${id}/return`)).data;


