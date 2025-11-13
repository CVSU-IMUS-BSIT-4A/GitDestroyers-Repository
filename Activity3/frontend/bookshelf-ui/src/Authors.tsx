import React, { useEffect, useState } from 'react';
import { listAuthors, createAuthor, deleteAuthor, type Author } from './api';

export default function Authors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAuthors();
  }, []);

  async function loadAuthors() {
    try {
      setLoading(true);
      const data = await listAuthors();
      setAuthors(data);
    } catch (error) {
      console.error('Failed to load authors:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addAuthor() {
    const name = value.trim();
    if (!name) return;
    if (authors.find(a => a.name.toLowerCase() === name.toLowerCase())) {
      setValue('');
      return;
    }

    try {
      setSubmitting(true);
      await createAuthor(name);
      setValue('');
      await loadAuthors();
    } catch (error: any) {
      console.error('Failed to create author:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create author. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  async function removeAuthor(id: number) {
    if (!confirm('Are you sure you want to delete this author?')) return;
    try {
      await deleteAuthor(id);
      await loadAuthors();
    } catch (error: any) {
      console.error('Failed to delete author:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete author. Please try again.';
      alert(errorMessage);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2 className="item-title" style={{ marginBottom: 16 }}>Authors</h2>
      <div className="row" style={{ marginBottom: 16 }}>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && addAuthor()}
          placeholder="New author"
          className="input"
          style={{ flex: 1 }}
        />
        <button
          onClick={addAuthor}
          disabled={submitting || !value.trim()}
          className="button primary"
        >
          {submitting ? 'Adding...' : 'Add'}
        </button>
      </div>

      <ul className="list">
        {authors.map(author => (
          <li key={author.id} className="card">
            <div className="item">
              <div className="item-main">
                <div className="item-title">{author.name}</div>
              </div>
              <button
                onClick={() => removeAuthor(author.id)}
                className="button"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {authors.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--muted)' }}>
          No authors yet
        </div>
      )}
    </div>
  );
}
