import React from 'react';
import { Book } from '../types';

type Props = {
  book: Book;
  onClose: () => void;
};

export function BookPreviewModal({ book, onClose }: Props) {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: 24,
          borderRadius: 8,
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>

        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
          <div style={{ 
            width: 200, 
            minWidth: 200,
            height: 300, 
            background: '#f4f4f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: 4,
          }}>
            {book.coverUrl ? (
              <img 
                src={book.coverUrl} 
                alt={book.title} 
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }} 
              />
            ) : (
              <span>No cover</span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 16px 0' }}>{book.title}</h2>
            
            <div style={{ marginBottom: 24 }}>
              {book.author && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Author:</strong> {book.author}
                </div>
              )}
              {book.category && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Category:</strong> {book.category}
                </div>
              )}
              {book.publishedYear && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Published:</strong> {book.publishedYear}
                </div>
              )}
              {book.isbn && (
                <div style={{ marginBottom: 8 }}>
                  <strong>ISBN:</strong> {book.isbn}
                </div>
              )}
              {book.pageCount && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Pages:</strong> {book.pageCount}
                </div>
              )}
              {book.borrowed && (
                <div style={{ 
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#2e7d32'
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#2e7d32'
                  }} />
                  <span>
                    Borrowed
                    {book.borrowedDate && ` on ${new Date(book.borrowedDate).toLocaleDateString()}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {book.plot && (
          <div>
            <h3 style={{ marginBottom: 12 }}>Plot</h3>
            <p style={{ 
              lineHeight: 1.6,
              color: '#333',
              whiteSpace: 'pre-wrap'
            }}>
              {book.plot}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}