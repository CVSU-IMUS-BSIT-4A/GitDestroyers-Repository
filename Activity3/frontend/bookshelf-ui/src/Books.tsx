import { useEffect, useMemo, useState } from 'react';
import type { Author, Book, Category } from './api';
import { createBook, deleteBook, listAuthors, listBooks, listCategories, updateBook } from './api';

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();

  useEffect(() => { (async () => {
    setBooks(await listBooks());
    setAuthors(await listAuthors());
    setCategories(await listCategories());
  })(); }, []);

  async function add() {
    if (!title.trim()) return;
    const created = await createBook({ title: title.trim(), authorId, categoryId });
    // Hydrate relations locally so the UI shows names immediately
    const hydrated: Book = {
      ...created,
      author: authorId ? authors.find(a => a.id === authorId) ?? created.author : null,
      category: categoryId ? categories.find(c => c.id === categoryId) ?? created.category : null,
    };
    setBooks(prev => [hydrated, ...prev]);
    setTitle(''); setAuthorId(undefined); setCategoryId(undefined);
  }

  return (
    <div>
      <h2>Books</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 200px 100px', gap: 8, marginBottom: 12 }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <select value={authorId ?? ''} onChange={e => setAuthorId(e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">No author</option>
          {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={categoryId ?? ''} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">No category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={add}>Add</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
        {books.map(b => <Row key={b.id} book={b} authors={authors} categories={categories} onSave={async (payload) => {
          const updated = await updateBook(b.id, payload);
          setBooks(prev => prev.map(x => x.id === b.id ? updated : x));
        }} onDelete={async () => { await deleteBook(b.id); setBooks(prev => prev.filter(x => x.id !== b.id)); }} />)}
      </ul>
    </div>
  );
}

function Row({ book, authors, categories, onSave, onDelete }: { book: Book; authors: Author[]; categories: Category[]; onSave: (p: { title?: string; authorId?: number | null; categoryId?: number | null }) => void | Promise<void>; onDelete: () => void | Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [authorId, setAuthorId] = useState<number | ''>(book.author?.id ?? '');
  const [categoryId, setCategoryId] = useState<number | ''>(book.category?.id ?? '');

  return (
    <li style={{ border: '1px solid #ddd', padding: 8, borderRadius: 6 }}>
      {!editing ? (
        <div>
          <div style={{ fontWeight: 600 }}>{book.title}</div>
          <div style={{ color: '#555' }}>
            {book.author?.name ?? '—'} · {book.category?.name ?? '—'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 200px', gap: 8 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} />
          <select value={authorId} onChange={e => setAuthorId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">No author</option>
            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">No category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {!editing ? (
          <>
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={() => onDelete()}>Delete</button>
          </>
        ) : (
          <>
            <button onClick={() => { onSave({ title, authorId: authorId === '' ? null : Number(authorId), categoryId: categoryId === '' ? null : Number(categoryId) }); setEditing(false); }}>Save</button>
            <button onClick={() => { setEditing(false); setTitle(book.title); setAuthorId(book.author?.id ?? ''); setCategoryId(book.category?.id ?? ''); }}>Cancel</button>
          </>
        )}
      </div>
    </li>
  );
}


