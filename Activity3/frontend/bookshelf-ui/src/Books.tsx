import React, { useEffect, useState } from 'react';
import { BookPreviewModal } from './components/BookPreviewModal';

// Update the Book type to include borrowed status
type Book = {
  id: string;
  title: string;
  author?: string;
  category?: string;
  publishedYear?: number | null;
  isbn?: string;
  pageCount?: number | null;
  coverUrl?: string;
  plot?: string;
  borrowed?: boolean;
  borrowedDate?: string;
};

type Filter = {
  search: string;
  author: string;
  category: string;
};

const ITEMS_PER_PAGE = 5; // Adjust this number to change items per page

export default function Books() {
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const raw = localStorage.getItem('books');
      return raw ? (JSON.parse(raw) as Book[]) : [];
    } catch {
      return [];
    }
  });

  // Add filter state
  const [filters, setFilters] = useState<Filter>({
    search: '',
    author: '',
    category: '',
  });

  // Add unique authors and categories lists
  const uniqueAuthors = Array.from(new Set(books.map(b => b.author).filter(Boolean)));
  const uniqueCategories = Array.from(new Set(books.map(b => b.category).filter(Boolean)));

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Add this after your existing useState declarations
  const [borrowedBooks, setBorrowedBooks] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('borrowedBooks');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  // Add this state near your other useState declarations
  const [previewBook, setPreviewBook] = useState<Book | null>(null);

  // Filter books based on search and filters
  const filteredBooks = books.filter(book => {
    const matchesSearch = !filters.search || 
      book.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      book.author?.toLowerCase().includes(filters.search.toLowerCase()) ||
      book.category?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesAuthor = !filters.author || book.author === filters.author;
    const matchesCategory = !filters.category || book.category === filters.category;

    return matchesSearch && matchesAuthor && matchesCategory;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    function refresh() {
      try {
        const raw = localStorage.getItem('books');
        setBooks(raw ? (JSON.parse(raw) as Book[]) : []);
      } catch {
        // ignore
      }
    }

    // storage events from other tabs
    function onStorage(e: StorageEvent) {
      if (e.key === 'books') refresh();
    }
    window.addEventListener('storage', onStorage);

    // custom event from ManageBooks in same tab
    function onBooksChanged() {
      refresh();
    }
    window.addEventListener('books:changed', onBooksChanged as EventListener);

    // initial
    refresh();

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('books:changed', onBooksChanged as EventListener);
    };
  }, []);

  function handleDelete(id: string) {
    const next = books.filter(b => b.id !== id);
    setBooks(next);
    try {
      localStorage.setItem('books', JSON.stringify(next));
      window.dispatchEvent(new Event('books:changed'));
    } catch {}
  }

  // Add this function to handle borrowing
  function handleBorrow(id: string) {
    const nextBorrowed = new Set(borrowedBooks);
    const book = books.find(b => b.id === id);
    
    if (!book) return;
    
    if (nextBorrowed.has(id)) {
      nextBorrowed.delete(id);
    } else {
      nextBorrowed.add(id);
    }
    
    setBorrowedBooks(nextBorrowed);
    
    // Update the book's borrowed status
    const nextBooks = books.map(b => {
      if (b.id === id) {
        return {
          ...b,
          borrowed: !b.borrowed,
          borrowedDate: !b.borrowed ? new Date().toISOString() : undefined
        };
      }
      return b;
    });
    
    setBooks(nextBooks);
    
    // Save both states to localStorage
    try {
      localStorage.setItem('borrowedBooks', JSON.stringify([...nextBorrowed]));
      localStorage.setItem('books', JSON.stringify(nextBooks));
      window.dispatchEvent(new Event('books:changed'));
    } catch {}
  }

  // Pagination controls component
  const PaginationControls = () => (
    <div style={{ 
      display: 'flex', 
      gap: 8, 
      alignItems: 'center',
      justifyContent: 'center',
      margin: '24px 0'
    }}>
      <button 
        onClick={() => setCurrentPage(1)} 
        disabled={currentPage === 1}
      >
        First
      </button>
      <button 
        onClick={() => setCurrentPage(p => p - 1)} 
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span style={{ margin: '0 16px' }}>
        Page {currentPage} of {totalPages || 1}
      </span>
      <button 
        onClick={() => setCurrentPage(p => p + 1)} 
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      <button 
        onClick={() => setCurrentPage(totalPages)} 
        disabled={currentPage === totalPages}
      >
        Last
      </button>
      <select 
        value={ITEMS_PER_PAGE} 
        onChange={(e) => {
          const newPerPage = Number(e.target.value);
          const newTotalPages = Math.ceil(filteredBooks.length / newPerPage);
          setCurrentPage(1);
          // You would need to add state for itemsPerPage if you want this to be changeable
        }}
        style={{ marginLeft: 16 }}
      >
        <option value={5}>5 per page</option>
        <option value={10}>10 per page</option>
        <option value={20}>20 per page</option>
      </select>
    </div>
  );

  return (
    <div>
     

      {/* Add filter controls */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: 16, 
        borderRadius: 8, 
        marginBottom: 24 
      }}>
        <h3 style={{ margin: '0 0 12px 0' }}>What Books are you looking for?</h3>
        <div style={{ display: 'grid', gap: 12, maxWidth: 600 }}>
          <input
            type="text"
            placeholder="Search by title, author, or category..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{ padding: '8px 12px' }}
          />

          <div style={{ display: 'flex', gap: 12 }}>
            <select
              value={filters.author}
              onChange={e => setFilters(prev => ({ ...prev, author: e.target.value }))}
              style={{ padding: '8px 12px', flex: 1 }}
            >
              <option value="">All Authors</option>
              {uniqueAuthors.map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
              style={{ padding: '8px 12px', flex: 1 }}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <button
              onClick={() => setFilters({ search: '', author: '', category: '' })}
              style={{ padding: '8px 16px' }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <h3>Books ({filteredBooks.length} of {books.length})</h3>
      
      {/* Add top pagination */}
      {filteredBooks.length > ITEMS_PER_PAGE && <PaginationControls />}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {paginatedBooks.map(b => (
          <li key={b.id} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 96, height: 140, background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {b.coverUrl ? <img src={b.coverUrl} alt={b.title} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <small>No cover</small>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>{b.title}</strong>
                {b.borrowed && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 4,
                    color: '#2e7d32',
                    fontSize: 14 
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#2e7d32'
                    }} />
                    Borrowed
                    {b.borrowedDate && (
                      <span style={{ color: '#666', fontSize: 12 }}>
                        ({new Date(b.borrowedDate).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div>{b.author && <span>By {b.author} · </span>}{b.category && <span>{b.category} · </span>}</div>
              <div style={{ marginTop: 6, fontSize: 13, color: '#444' }}>
                {b.publishedYear ? <span>Published: {b.publishedYear} · </span> : null}
                {b.isbn ? <span>ISBN: {b.isbn} · </span> : null}
                {b.pageCount ? <span>{b.pageCount} pages</span> : null}
              </div>
              {/* Plot section */}
              {b.plot && (
                <details style={{ marginTop: 8 }}>
                  <summary style={{ cursor: 'pointer' }}>Plot</summary>
                  <p style={{ margin: '8px 0', fontSize: 14 }}>{b.plot}</p>
                </details>
              )}
              <div style={{ marginTop: 8 }}>
                <button 
                  onClick={() => setPreviewBook(b)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #ddd',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Preview Book
                </button>
                <button 
                  onClick={() => handleBorrow(b.id)} 
                  style={{ 
                    marginLeft: 8,
                    backgroundColor: b.borrowed ? '#f44336' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  {b.borrowed ? 'Return Book' : 'Borrow'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Add bottom pagination */}
      {filteredBooks.length > ITEMS_PER_PAGE && <PaginationControls />}

      {/* Show message if no results */}
      {filteredBooks.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '32px 16px',
          color: '#666',
          background: '#f5f5f5',
          borderRadius: 8
        }}>
          No books found matching your filters
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


