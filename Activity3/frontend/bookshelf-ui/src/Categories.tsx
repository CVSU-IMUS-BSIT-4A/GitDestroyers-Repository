import React, { useEffect, useState } from 'react';
import { listCategories, createCategory, deleteCategory, type Category } from './api';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await listCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addCategory() {
    const name = value.trim();
    if (!name) return;

    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      setValue('');
      return;
    }

    try {
      setSubmitting(true);
      await createCategory(name);
      setValue('');
      await loadCategories();
    } catch (error: any) {
      console.error('Failed to create category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create category. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  async function removeCategory(id: number) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete category. Please try again.';
      alert(errorMessage);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2 className="item-title" style={{ marginBottom: 16 }}>Categories</h2>
      <div className="row" style={{ marginBottom: 16 }}>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && addCategory()}
          placeholder="New category"
          className="input"
          style={{ flex: 1 }}
        />
        <button
          onClick={addCategory}
          disabled={submitting || !value.trim()}
          className="button primary"
        >
          {submitting ? 'Adding...' : 'Add'}
        </button>
      </div>

      <ul className="list">
        {categories.map(category => (
          <li key={category.id} className="card">
            <div className="item">
              <div className="item-main">
                <div className="item-title">{category.name}</div>
              </div>
              <button
                onClick={() => removeCategory(category.id)}
                className="button"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--muted)' }}>
          No categories yet
        </div>
      )}
    </div>
  );
}
