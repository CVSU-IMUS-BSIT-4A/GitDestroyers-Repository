import { useState } from 'react';
import Authors from './Authors';
import Categories from './Categories';
import Books from './Books';

export default function App() {
  const [tab, setTab] = useState<'books' | 'authors' | 'categories'>('books');
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <h1>Bookshelf</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('books')} disabled={tab==='books'}>Books</button>
        <button onClick={() => setTab('authors')} disabled={tab==='authors'}>Authors</button>
        <button onClick={() => setTab('categories')} disabled={tab==='categories'}>Categories</button>
      </div>
      {tab === 'books' && <Books />}
      {tab === 'authors' && <Authors />}
      {tab === 'categories' && <Categories />}
    </div>
  );
}


