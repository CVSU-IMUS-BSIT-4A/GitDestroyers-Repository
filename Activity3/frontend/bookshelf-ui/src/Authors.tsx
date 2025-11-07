import React, { useEffect, useState } from 'react';

export default function Authors() {
  const [authors, setAuthors] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('authors');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [value, setValue] = useState('');

  useEffect(() => {
    // keep local state in sync if other tabs change storage
    function onStorage(e: StorageEvent) {
      if (e.key === 'authors') setAuthors(prev => {
        try { return JSON.parse(localStorage.getItem('authors') || '[]'); } catch { return prev; }
      });
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function saveList(next: string[]) {
    setAuthors(next);
    localStorage.setItem('authors', JSON.stringify(next));
    window.dispatchEvent(new Event('authors:changed')); // notify same-tab listeners
  }

  function addAuthor() {
    const name = value.trim();
    if (!name) return;
    if (authors.find(a => a.toLowerCase() === name.toLowerCase())) { setValue(''); return; }
    saveList([name, ...authors]);
    setValue('');
  }

  function removeAuthor(index: number) {
    const next = authors.slice();
    next.splice(index, 1);
    saveList(next);
  }

  return (
    <div>
      <h2>Authors</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={value} onChange={e => setValue(e.target.value)} placeholder="New author" />
        <button onClick={addAuthor}>Add</button>
      </div>
      <ul>
        {authors.map((a, i) => (
          <li key={a + i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>{a}</span>
            <button onClick={() => removeAuthor(i)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}


