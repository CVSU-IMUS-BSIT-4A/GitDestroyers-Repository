import React, { useEffect, useState } from 'react';

type Book = {
  id: string;
  title: string;
  author?: string;
  category?: string;
  publishedYear?: number | null;
  isbn?: string;
  pageCount?: number | null;
  coverUrl?: string;
  plot: string;    // Changed to required field, removed summary
};

type NamedItem = { id?: string; name: string };

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const raw = localStorage.getItem('books');
      return raw ? (JSON.parse(raw) as Book[]) : [];
    } catch {
      return [];
    }
  });

  const [authors, setAuthors] = useState<NamedItem[]>([]);
  const [categories, setCategories] = useState<NamedItem[]>([]);

  const [form, setForm] = useState({
    title: '',
    author: '',
    category: '',
    publishedYear: '',
    isbn: '',
    pageCount: '',
    coverUrl: '',
    plot: ''     // Keep plot, remove summary
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewAuthorInput, setShowNewAuthorInput] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // per-field error messages
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('books');
      setBooks(raw ? (JSON.parse(raw) as Book[]) : []);
    } catch {}
  }, []);

  function loadNamedList(key: string): NamedItem[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((x: any) => (typeof x === 'string' ? { name: x } : { id: x.id, name: x.name ?? String(x) }));
    } catch {
      return [];
    }
  }

  function refreshNamedLists() {
    setAuthors(loadNamedList('authors'));
    setCategories(loadNamedList('categories'));
  }

  useEffect(() => {
    refreshNamedLists();
    function onStorage(e: StorageEvent) {
      if (e.key === 'authors' || e.key === 'categories') refreshNamedLists();
    }
    window.addEventListener('storage', onStorage);

    // listen for same-tab custom events
    function onAuthorsChanged() { refreshNamedLists(); }
    function onCategoriesChanged() { refreshNamedLists(); }
    window.addEventListener('authors:changed', onAuthorsChanged as EventListener);
    window.addEventListener('categories:changed', onCategoriesChanged as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('authors:changed', onAuthorsChanged as EventListener);
      window.removeEventListener('categories:changed', onCategoriesChanged as EventListener);
    };
  }, []);

  function persistNamedList(key: string, items: NamedItem[]) {
    try {
      localStorage.setItem(key, JSON.stringify(items.map(i => (i.id ? { id: i.id, name: i.name } : i.name))));
      window.dispatchEvent(new Event(key === 'authors' ? 'authors:changed' : 'categories:changed'));
    } catch {}
  }

  function addNamedItemToStorage(key: string, name: string, setter: React.Dispatch<React.SetStateAction<NamedItem[]>>) {
    const list = loadNamedList(key);
    const exists = list.find(l => l.name.toLowerCase() === name.toLowerCase());
    if (exists) return;
    const newItem = { id: crypto.randomUUID?.() ?? String(Date.now()), name };
    const next = [newItem, ...list];
    setter(next);
    persistNamedList(key, next);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // clear error for this field when user types/selects
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  }

  function handleIsbnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const filtered = raw.replace(/[^0-9Xx-\s]/g, '');
    const significant = filtered.replace(/[-\s]/g, '');
    if (significant.length > 13) return; // stop accepting more significant chars
    setForm(prev => ({ ...prev, isbn: filtered }));
    setErrors(prev => { const c = { ...prev }; delete c.isbn; return c; });
  }

  function validateIsbn(isbn: string) {
    const cleaned = isbn.replace(/[-\s]/g, '');
    return /^[0-9Xx]{10,13}$/.test(cleaned);
  }

  function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setForm(prev => ({ ...prev, coverUrl: '' }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, coverUrl: 'Selected file is not an image' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setForm(prev => ({ ...prev, coverUrl: dataUrl }));
      setErrors(prev => { const c = { ...prev }; delete c.coverUrl; return c; });
    };
    reader.readAsDataURL(file);
  }

  function removeCoverImage() {
    setForm(prev => ({ ...prev, coverUrl: '' }));
  }

  function saveBooks(next: Book[]) {
    setBooks(next);
    try {
      localStorage.setItem('books', JSON.stringify(next));
      window.dispatchEvent(new Event('books:changed'));
    } catch {}
  }

  function handleAddOrSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const nextErrors: Record<string, string> = {};

    // Title required
    if (!form.title.trim()) nextErrors.title = 'Title is required';

    // Author required (if new author input shown, require its value)
    if (showNewAuthorInput) {
      if (!form.author.trim()) nextErrors.author = 'New author name is required';
    } else {
      if (!form.author.trim()) nextErrors.author = 'Select an author or add new';
    }

    // Category required
    if (showNewCategoryInput) {
      if (!form.category.trim()) nextErrors.category = 'New category name is required';
    } else {
      if (!form.category.trim()) nextErrors.category = 'Select a category or add new';
    }

    // Published year required
    if (!form.publishedYear) nextErrors.publishedYear = 'Published year is required';

    // ISBN required and valid
    if (!form.isbn.trim()) nextErrors.isbn = 'ISBN is required';
    else if (!validateIsbn(form.isbn.trim())) nextErrors.isbn = 'ISBN must be 10–13 digits (dashes/spaces allowed)';

    // Page count required and positive integer
    if (!form.pageCount.trim()) nextErrors.pageCount = 'Page count is required';
    else if (!/^\d+$/.test(form.pageCount.trim()) || Number(form.pageCount) <= 0) nextErrors.pageCount = 'Page count must be a positive integer';

    // Cover image required
    if (!form.coverUrl) nextErrors.coverUrl = 'Cover image is required';

    // Add plot validation
    if (!form.plot.trim()) {
      nextErrors.plot = 'Plot is required';
    } else if (form.plot.trim().length < 100) {
      nextErrors.plot = 'Plot must be at least 100 characters long';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      // focus first invalid field (optional)
      const firstKey = Object.keys(nextErrors)[0];
      const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement | null;
      el?.focus();
      return;
    }

    // persist any new author/category before saving the book
    if (showNewAuthorInput && form.author.trim()) {
      addNamedItemToStorage('authors', form.author.trim(), setAuthors);
      setShowNewAuthorInput(false);
    }
    if (showNewCategoryInput && form.category.trim()) {
      addNamedItemToStorage('categories', form.category.trim(), setCategories);
      setShowNewCategoryInput(false);
    }

    const payload: Book = {
      id: editingId ?? (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
      isbn: form.isbn.trim(),
      pageCount: form.pageCount ? Number(form.pageCount) : null,
      coverUrl: form.coverUrl.trim() || undefined,
      plot: form.plot.trim()
    };

    if (editingId) {
      const next = books.map(b => (b.id === editingId ? payload : b));
      saveBooks(next);
    } else {
      saveBooks([payload, ...books]);
    }

    // reset form + errors
    setForm({ title: '', author: '', category: '', publishedYear: '', isbn: '', pageCount: '', coverUrl: '', plot: '' });
    setEditingId(null);
    setErrors({});
    setShowNewAuthorInput(false);
    setShowNewCategoryInput(false);
  }

  function handleEdit(book: Book) {
    setEditingId(book.id);
    setForm({
      title: book.title || '',
      author: book.author || '',
      category: book.category || '',
      publishedYear: book.publishedYear ? String(book.publishedYear) : '',
      isbn: book.isbn || '',
      pageCount: book.pageCount ? String(book.pageCount) : '',
      coverUrl: book.coverUrl || '',
      plot: book.plot
    });
    refreshNamedLists();
    setErrors({});
  }

  function handleDelete(id: string) {
    const next = books.filter(b => b.id !== id);
    saveBooks(next);
    if (editingId === id) {
      setEditingId(null);
      setForm({ title: '', author: '', category: '', publishedYear: '', isbn: '', pageCount: '', coverUrl: '', plot: '' });
      setErrors({});
    }
  }

  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= 1980; y--) years.push(y);

  return (
    <div>
      <h2>Manage Books</h2>

      <form onSubmit={handleAddOrSave} style={{ display: 'grid', gap: 8, maxWidth: 700 }}>
        <div>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title *" />
          {errors.title && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.title}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Author</label>
          <select
            name="author"
            value={form.author}
            onChange={(e) => {
              const val = e.target.value;
              setForm(prev => ({ ...prev, author: val }));
              setErrors(prev => { const c = { ...prev }; delete c.author; return c; });
            }}
          >
            <option value="">— select —</option>
            {authors.map(author => (
              <option key={author.id}>{author.name}</option>
            ))}
          </select>
          {showNewAuthorInput && (
            <div style={{ marginTop: 6 }}>
              <input name="author" value={form.author} onChange={handleChange} placeholder="New author name" />
            </div>
          )}
          {errors.author && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.author}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Category</label>
          <select
            name="category"
            value={showNewCategoryInput ? '__new__' : form.category}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '__new__') {
                setShowNewCategoryInput(true);
                setForm(prev => ({ ...prev, category: '' }));
                setErrors(prev => { const c = { ...prev }; delete c.category; return c; });
              } else {
                setShowNewCategoryInput(false);
                setForm(prev => ({ ...prev, category: val }));
                setErrors(prev => { const c = { ...prev }; delete c.category; return c; });
              }
            }}
          >
            <option value="">— select —</option>
            {categories.map(c => (
              <option key={c.id ?? c.name} value={c.name}>
                {c.name}
              </option>
            ))}
            <option value="__new__">+ Add new category…</option>
          </select>
          {showNewCategoryInput && (
            <div style={{ marginTop: 6 }}>
              <input name="category" value={form.category} onChange={handleChange} placeholder="New category name" />
            </div>
          )}
          {errors.category && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.category}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Published year</label>
          <select name="publishedYear" value={form.publishedYear} onChange={handleChange}>
            <option value="">— select —</option>
            {years.map(y => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
          {errors.publishedYear && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.publishedYear}</div>}
        </div>

        <div>
          <input
            name="isbn"
            value={form.isbn}
            onChange={handleIsbnChange}
            placeholder="ISBN (10-13 digits; dashes/spaces allowed) *"
          />
          {errors.isbn && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.isbn}</div>}
        </div>

        <div>
          <input
            name="pageCount"
            value={form.pageCount}
            onChange={handleChange}
            placeholder="Page count *"
            type="number"
            min={1}
          />
          {errors.pageCount && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.pageCount}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Cover image *</label>
          <input type="file" accept="image/*" onChange={handleCoverFileChange} name="coverUrl" />
          {form.coverUrl ? (
            <div style={{ marginTop: 8 }}>
              <div style={{ width: 120, height: 160, border: '1px solid #ddd', overflow: 'hidden' }}>
                <img src={form.coverUrl} alt="cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ marginTop: 8 }}>
                <button type="button" onClick={removeCoverImage}>Remove image</button>
              </div>
            </div>
          ) : null}
          {errors.coverUrl && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.coverUrl}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>
            Plot *
            <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
              (Minimum 100 characters)
            </span>
          </label>
          <textarea
            name="plot"
            value={form.plot}
            onChange={handleChange}
            placeholder="Enter the plot of the book..."
            style={{ 
              width: '100%', 
              minHeight: 50,
              padding: 8,
              resize: 'vertical',
              border: errors.plot ? '1px solid red' : undefined
            }}
          />
          {errors.plot && (
            <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
              {errors.plot}
            </div>
          )}
          <div style={{ 
            fontSize: 12, 
            color: form.plot.length < 100 ? '#666' : '#008000',
            marginTop: 4 
          }}>
            {form.plot.length} / 100 characters minimum
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{editingId ? 'Save' : 'Add Book'}</button>
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ title: '', author: '', category: '', publishedYear: '', isbn: '', pageCount: '', coverUrl: '', plot: '' });
              setShowNewAuthorInput(false);
              setShowNewCategoryInput(false);
              setErrors({});
            }}
          >
            Reset
          </button>
        </div>
      </form>

      <h3 style={{ marginTop: 24 }}>Existing books ({books.length})</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {books.map(b => (
          <li key={b.id} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 96, height: 140, background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {b.coverUrl ? <img src={b.coverUrl} alt={b.title} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <small>No cover</small>}
            </div>
            <div style={{ flex: 1 }}>
              <strong>{b.title}</strong>
              <div>{b.author && <span>By {b.author} · </span>}{b.category && <span>{b.category} · </span>}</div>
              <div style={{ marginTop: 6, fontSize: 13, color: '#444' }}>
                {b.publishedYear ? <span>Published: {b.publishedYear} · </span> : null}
                {b.isbn ? <span>ISBN: {b.isbn} · </span> : null}
                {b.pageCount ? <span>{b.pageCount} pages</span> : null}
              </div>
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer' }}>Plot</summary>
                <p style={{ margin: '8px 0', fontSize: 14 }}>{b.plot}</p>
              </details>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => handleEdit(b)}>Edit</button>
                <button onClick={() => handleDelete(b.id)} style={{ marginLeft: 8 }}>Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}