import React, { useEffect, useState } from 'react';

type Category = {
  id?: string;
  name: string;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const raw = localStorage.getItem('categories');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  
  const [value, setValue] = useState('');

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'categories') {
        setCategories(prev => {
          try {
            const raw = localStorage.getItem('categories');
            return raw ? JSON.parse(raw) : prev;
          } catch {
            return prev;
          }
        });
      }
    }
    
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function saveList(next: Category[]) {
    setCategories(next);
    localStorage.setItem('categories', JSON.stringify(next));
    window.dispatchEvent(new Event('categories:changed'));
  }

  function addCategory() {
    const name = value.trim();
    if (!name) return;
    
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      setValue('');
      return;
    }

    const newCategory: Category = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      name
    };

    saveList([newCategory, ...categories]);
    setValue('');
  }

  function removeCategory(index: number) {
    const next = categories.slice();
    next.splice(index, 1);
    saveList(next);
  }

  return (
    <div>
      <h2>Categories</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input 
          value={value} 
          onChange={e => setValue(e.target.value)}
          placeholder="New category"
          onKeyPress={e => e.key === 'Enter' && addCategory()}
        />
        <button onClick={addCategory}>Add</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {categories.map((category, i) => (
          <li 
            key={category.id ?? i} 
            style={{ 
              display: 'flex', 
              gap: 8, 
              alignItems: 'center',
              marginBottom: 8,
              padding: 8,
              border: '1px solid #ddd',
              borderRadius: 4
            }}
          >
            <span>{category.name}</span>
            <button onClick={() => removeCategory(i)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}


