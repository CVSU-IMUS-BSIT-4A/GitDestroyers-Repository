import React, { useEffect, useState } from 'react';
import { BookPreviewModal } from './components/BookPreviewModal';
import { listBooks, borrowBook, returnBook, deleteBook, type Book } from './api';
import { Search, X } from 'lucide-react';

type Filter = {
  search: string;
  author: string;
  category: string;
};

const ITEMS_PER_PAGE_OPTIONS = [3, 5, 10, 20];

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filter>({
    search: '',
    author: '',
    category: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    try {
      setLoading(true);
      const data = await listBooks();
      setBooks(data);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  }

  const uniqueAuthors = Array.from(new Set(books.map(b => b.author?.name).filter(Boolean) as string[]));
  const uniqueCategories = Array.from(new Set(books.map(b => b.category?.name).filter(Boolean) as string[]));

  const filteredBooks = books.filter(book => {
    const matchesSearch = !filters.search ||
      book.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      book.author?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      book.category?.name?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesAuthor = !filters.author || book.author?.name === filters.author;
    const matchesCategory = !filters.category || book.category?.name === filters.category;

    return matchesSearch && matchesAuthor && matchesCategory;
  });

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, itemsPerPage]);

  async function handleBorrow(id: number) {
    try {
      const book = books.find(b => b.id === id);
      if (!book) return;

      if (book.borrowed) {
        await returnBook(id);
      } else {
        await borrowBook(id);
      }
      await loadBooks();
    } catch (error) {
      console.error('Failed to update borrow status:', error);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await deleteBook(id);
      await loadBooks();
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="controls" style={{ marginBottom: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="What Books are you looking for?"
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="input"
            style={{ paddingLeft: 40 }}
          />
        </div>
        <select
          value={filters.author}
          onChange={e => setFilters(prev => ({ ...prev, author: e.target.value }))}
          className="select"
        >
          <option value="">All Authors</option>
          {uniqueAuthors.map(author => (
            <option key={author} value={author}>{author}</option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
          className="select"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={itemsPerPage}
          onChange={e => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="select"
        >
          {ITEMS_PER_PAGE_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt} per page</option>
          ))}
        </select>
        {(filters.search || filters.author || filters.category) && (
          <button
            onClick={() => setFilters({ search: '', author: '', category: '' })}
            className="button"
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <X size={14} />
            Reset Filters
          </button>
        )}
      </div>

      <div style={{ marginBottom: 12, color: 'var(--muted)', fontSize: 14 }}>
        Books ({filteredBooks.length} of {books.length})
      </div>

      <ul className="list">
        {paginatedBooks.map(book => (
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
                {book.author?.name && (
                  <div className="item-desc" style={{ marginTop: 4 }}>{book.author.name}</div>
                )}
                {book.borrowed && (
                  <div className="chip success" style={{ marginTop: 8, display: 'inline-block' }}>
                    Borrowed{book.borrowedDate && ` on ${new Date(book.borrowedDate).toLocaleDateString()}`}
                  </div>
                )}
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button
                  onClick={() => setPreviewBook(book)}
                  className="button"
                >
                  Preview Book
                </button>
                <button
                  onClick={() => handleBorrow(book.id)}
                  className={`button ${book.borrowed ? 'return' : 'primary'}`}
                    >
                    {book.borrowed ? 'Return Book' : 'Borrow'}
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

      {filteredBooks.length > 0 && (
        <div className="row" style={{ marginTop: 12, justifyContent: 'center', gap: 8 }}>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1 || totalPages <= 1}
            className="button"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1 || totalPages <= 1}
            className="button"
          >
            Previous
          </button>
          <span style={{ color: 'var(--muted)', padding: '0 8px' }}>
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages || totalPages <= 1}
            className="button"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages <= 1}
            className="button"
          >
            Last
          </button>
        </div>
      )}

      {filteredBooks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--muted)' }}>
          No books found
        </div>
      )}

      {previewBook && (
        <BookPreviewModal
          book={previewBook}
          onClose={() => setPreviewBook(null)}
        />
      )}
    </div>
  );
}
