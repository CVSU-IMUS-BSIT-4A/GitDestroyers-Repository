import React, { useEffect, useState } from 'react';
import {
  listBooks,
  createBook,
  updateBook,
  deleteBook,
  listAuthors,
  createAuthor,
  listCategories,
  createCategory,
  type Book,
  type Author,
  type Category,
} from './api';

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    authorId: '',
    categoryId: '',
    publishedYear: '',
    isbn: '',
    pageCount: '',
    coverUrl: '',
    plot: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewAuthorInput, setShowNewAuthorInput] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [booksData, authorsData, categoriesData] = await Promise.all([
        listBooks(),
        listAuthors(),
        listCategories(),
      ]);
      setBooks(booksData);
      setAuthors(authorsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
    if (significant.length > 13) return;
    setForm(prev => ({ ...prev, isbn: filtered }));
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.isbn;
      return copy;
    });
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
    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, coverUrl: 'Image size must be 10MB or less' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setForm(prev => ({ ...prev, coverUrl: dataUrl }));
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.coverUrl;
        return copy;
      });
    };
    reader.readAsDataURL(file);
  }

  function removeCoverImage() {
    setForm(prev => ({ ...prev, coverUrl: '' }));
  }

  async function handleAddOrSave(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!form.title.trim()) nextErrors.title = 'Title is required';

    let authorId: number | undefined;
    if (showNewAuthorInput) {
      if (!newAuthorName.trim()) {
        nextErrors.author = 'New author name is required';
      } else {
        // Will create author during save
      }
    } else {
      if (!form.authorId) {
        nextErrors.author = 'Select an author or add new';
      } else {
        authorId = Number(form.authorId);
      }
    }

    let categoryId: number | undefined;
    if (showNewCategoryInput) {
      if (!newCategoryName.trim()) {
        nextErrors.category = 'New category name is required';
      } else {
        // Will create category during save
      }
    } else {
      if (!form.categoryId) {
        nextErrors.category = 'Select a category or add new';
      } else {
        categoryId = Number(form.categoryId);
      }
    }

    if (!form.publishedYear) {
      nextErrors.publishedYear = 'Published year is required';
    } else if (Number(form.publishedYear) < 1000) {
      nextErrors.publishedYear = 'Published year must be valid';
    }

    if (!form.isbn.trim()) {
      nextErrors.isbn = 'ISBN is required';
    } else if (!validateIsbn(form.isbn.trim())) {
      nextErrors.isbn = 'ISBN must be 10–13 digits (dashes/spaces allowed)';
    }

    if (!form.pageCount.trim()) {
      nextErrors.pageCount = 'Page count is required';
    } else if (!/^\d+$/.test(form.pageCount.trim()) || Number(form.pageCount) <= 0) {
      nextErrors.pageCount = 'Page count must be a positive integer';
    }

    if (!form.coverUrl) {
      nextErrors.coverUrl = 'Cover image is required';
    }

    if (!form.plot.trim()) {
      nextErrors.plot = 'Plot is required';
    } else if (form.plot.trim().length < 100) {
      nextErrors.plot = 'Plot must be at least 100 characters long';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const firstKey = Object.keys(nextErrors)[0];
      const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement | null;
      el?.focus();
      return;
    }

    try {
      setSubmitting(true);

      // Create new author if needed
      if (showNewAuthorInput && newAuthorName.trim()) {
        const newAuthor = await createAuthor(newAuthorName.trim());
        authorId = newAuthor.id;
        await loadData();
      }

      // Create new category if needed
      if (showNewCategoryInput && newCategoryName.trim()) {
        const newCategory = await createCategory(newCategoryName.trim());
        categoryId = newCategory.id;
        await loadData();
      }

      const payload = {
        title: form.title.trim(),
        authorId,
        categoryId,
        publishedYear: Number(form.publishedYear),
        isbn: form.isbn.trim(),
        pageCount: Number(form.pageCount),
        coverUrl: form.coverUrl.trim(),
        plot: form.plot.trim(),
      };

      if (editingId) {
        await updateBook(editingId, payload);
      } else {
        await createBook(payload);
      }

      await loadData();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save book:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save book. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setForm({
      title: '',
      authorId: '',
      categoryId: '',
      publishedYear: '',
      isbn: '',
      pageCount: '',
      coverUrl: '',
      plot: '',
    });
    setEditingId(null);
    setErrors({});
    setShowNewAuthorInput(false);
    setShowNewCategoryInput(false);
    setNewAuthorName('');
    setNewCategoryName('');
  }

  function handleEdit(book: Book) {
    setEditingId(book.id);
    setForm({
      title: book.title || '',
      authorId: book.author?.id ? String(book.author.id) : '',
      categoryId: book.category?.id ? String(book.category.id) : '',
      publishedYear: book.publishedYear ? String(book.publishedYear) : '',
      isbn: book.isbn || '',
      pageCount: book.pageCount ? String(book.pageCount) : '',
      coverUrl: book.coverUrl || '',
      plot: book.plot || '',
    });
    setShowNewAuthorInput(false);
    setShowNewCategoryInput(false);
    setErrors({});
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await deleteBook(id);
      await loadData();
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
      alert('Failed to delete book. Please try again.');
    }
  }

  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= 1000; y--) years.push(y);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <form
        onSubmit={handleAddOrSave}
        className="grid"
        style={{ maxWidth: '600px', marginBottom: 32 }}
      >
        <h2 className="item-title" style={{ marginBottom: 16 }}>
          {editingId ? 'Edit Book' : 'Add New Book'}
        </h2>

        {/* Title */}
        <div>
          <label className="label">Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter book title"
            className="input"
          />
          {errors.title && <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.title}</span>}
        </div>

        {/* Author */}
        <div>
          <label className="label">Author *</label>
          {!showNewAuthorInput ? (
            <select
              name="authorId"
              value={form.authorId}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  setShowNewAuthorInput(true);
                  setForm(prev => ({ ...prev, authorId: '' }));
                } else {
                  handleChange(e);
                }
              }}
              className="select"
            >
              <option value="">Select author</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>{author.name}</option>
              ))}
              <option value="__new__">+ Add new author</option>
            </select>
          ) : (
            <div className="grid" style={{ gap: 8 }}>
              <input
                value={newAuthorName}
                onChange={(e) => {
                  setNewAuthorName(e.target.value);
                  setErrors(prev => {
                    const copy = { ...prev };
                    delete copy.author;
                    return copy;
                  });
                }}
                placeholder="New author name"
                className="input"
              />
              <button
                type="button"
                onClick={() => {
                  setShowNewAuthorInput(false);
                  setNewAuthorName('');
                }}
                className="button"
                style={{ fontSize: 12, padding: '6px 12px' }}
              >
                Cancel
              </button>
            </div>
          )}
          {errors.author && <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.author}</span>}
        </div>

        {/* Category */}
        <div>
          <label className="label">Category *</label>
          {!showNewCategoryInput ? (
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  setShowNewCategoryInput(true);
                  setForm(prev => ({ ...prev, categoryId: '' }));
                } else {
                  handleChange(e);
                }
              }}
              className="select"
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
              <option value="__new__">+ Add new category…</option>
            </select>
          ) : (
            <div className="grid" style={{ gap: 8 }}>
              <input
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  setErrors(prev => {
                    const copy = { ...prev };
                    delete copy.category;
                    return copy;
                  });
                }}
                placeholder="New category name"
                className="input"
              />
              <button
                type="button"
                onClick={() => {
                  setShowNewCategoryInput(false);
                  setNewCategoryName('');
                }}
                className="button"
                style={{ fontSize: 12, padding: '6px 12px' }}
              >
                Cancel
              </button>
            </div>
          )}
          {errors.category && <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.category}</span>}
        </div>

        {/* Published Year */}
        <div>
          <label className="label">Published Year *</label>
          <select
            name="publishedYear"
            value={form.publishedYear}
            onChange={handleChange}
            className="select"
          >
            <option value="">Select year</option>
            {years.map(y => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
          {errors.publishedYear && <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.publishedYear}</span>}
        </div>

        {/* ISBN */}
        <div>
          <label className="label">ISBN *</label>
          <input
            name="isbn"
            value={form.isbn}
            onChange={handleIsbnChange}
            placeholder="ISBN (10–13 digits)"
            className="input"
          />
          {errors.isbn && <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.isbn}</span>}
        </div>

        {/* Page Count */}
        <div>
          <label className="label">Page Count *</label>
          <input
            name="pageCount"
            type="number"
            min="1"
            value={form.pageCount}
            onChange={handleChange}
            placeholder="Number of pages"
            className="input"
          />
          {errors.pageCount && <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.pageCount}</span>}
        </div>

              {/* Cover Image */}
<div>
  <label className="label">Cover Image *</label>

  {/* Hidden file input */}
  <input
    id="coverUpload"
    type="file"
    accept="image/*"
    onChange={handleCoverFileChange}
    style={{ display: "none" }}
  />

  {/* Custom upload button */}
  <label
    htmlFor="coverUpload"
    style={{
      display: "inline-block",
      padding: "8px 14px",
      background: "#3b82f6",
      color: "white",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 500
    }}
  >
    Upload Cover
  </label>

  {/* Show file name (optional) */}
  {form.coverUrl && (
    <span style={{ marginLeft: 10, fontSize: 14, color: "#555" }}>
      Selected
    </span>
  )}

  {/* Preview + remove */}
  {form.coverUrl && (
    <div style={{ marginTop: 16 }}>
      <img
        src={form.coverUrl}
        alt="cover preview"
        className="book-cover"
        style={{ width: 96, height: 128, borderRadius: 6 }}
      />

      <button
        type="button"
        onClick={removeCoverImage}
        className="button"
        style={{
          marginTop: 8,
          fontSize: 12,
          padding: "6px 12px",
          background: "#e11d48",
          color: "white",
          borderRadius: 6
        }}
      >
        Remove
      </button>
    </div>
  )}  
          {errors.coverUrl && <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.coverUrl}</span>}
        </div>

        {/* Plot */}
        <div>
          <label className="label">
            Plot * (min 100 characters)
          </label>
          <textarea
            name="plot"
            value={form.plot}
            onChange={handleChange}
            placeholder="Enter book plot (minimum 100 characters)"
            rows={6}
            className="textarea"
          />
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            {form.plot.length} / 100 characters minimum
          </div>
          {errors.plot && <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.plot}</span>}
        </div>

        {/* Buttons */}
        <div className="row" style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button
            type="submit"
            disabled={submitting}
            className="button primary"
          >
            {submitting ? 'Saving...' : editingId ? 'Save' : 'Add Book'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="button"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Existing Books List */}
      <div style={{ marginTop: 32 }}>
        <h3 className="item-title" style={{ marginBottom: 16, fontSize: 14 }}>Existing Books ({books.length})</h3>
        <ul className="list">
          {books.map(book => (
            <li key={book.id} className="card">
              <div className="item">
                <div className="book-cover">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} />
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>No cover</span>
                  )}
                </div>
                <div className="item-main">
                  <div className="item-title">{book.title}</div>
                  <div className="item-desc" style={{ marginTop: 4 }}>
                    {book.author?.name && <span>{book.author.name}</span>}
                    {book.author?.name && book.category?.name && <span> · </span>}
                    {book.category?.name && <span>{book.category.name}</span>}
                  </div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button
                    onClick={() => handleEdit(book)}
                    className="button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {books.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--muted)' }}>
            No books yet
          </div>
        )}
      </div>
    </div>
  );
}
