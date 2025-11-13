import React from 'react';
import { Book } from '../api';

type Props = {
  book: Book;
  onClose: () => void;
};

export function BookPreviewModal({ book, onClose }: Props) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="button"
          style={{ position: 'absolute', top: 16, right: 16, padding: '4px 8px' }}
        >
          ×
        </button>

        <div style={{ padding: 20 }}>
          <div className="row" style={{ gap: 16, marginBottom: 20, alignItems: 'flex-start' }}>
            <div className="book-cover" style={{ width: 128, height: 192 }}>
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} />
              ) : (
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>No cover</span>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h2 className="item-title" style={{ fontSize: 24, marginBottom: 12 }}>{book.title}</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                {book.author?.name && (
                  <div>
                    <span style={{ color: 'var(--muted)' }}>Author</span> · {book.author.name}
                  </div>
                )}
                {book.category?.name && (
                  <div>
                    <span style={{ color: 'var(--muted)' }}>Category</span> · {book.category.name}
                  </div>
                )}
                {book.publishedYear && (
                  <div>
                    <span style={{ color: 'var(--muted)' }}>Published</span> · {book.publishedYear}
                  </div>
                )}
                {book.isbn && (
                  <div>
                    <span style={{ color: 'var(--muted)' }}>ISBN</span> · {book.isbn}
                  </div>
                )}
                {book.pageCount && (
                  <div>
                    <span style={{ color: 'var(--muted)' }}>Pages</span> · {book.pageCount}
                  </div>
                )}
                {book.borrowed && (
                  <div className="chip success" style={{ marginTop: 8, display: 'inline-block' }}>
                    Borrowed{book.borrowedDate && ` on ${new Date(book.borrowedDate).toLocaleDateString()}`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {book.plot && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <h3 className="item-title" style={{ marginBottom: 8 }}>Plot</h3>
              <p style={{ color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {book.plot}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
