import { useEffect, useState } from 'react';
import type { Category } from './api';
import { createCategory, deleteCategory, listCategories, updateCategory } from './api';

export default function Categories() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState('');

  useEffect(() => { (async () => setItems(await listCategories()))(); }, []);

  async function add() {
    if (!name.trim()) return;
    const created = await createCategory(name.trim());
    setItems(prev => [...prev, created]);
    setName('');
  }
  async function save(item: Category, newName: string) {
    const updated = await updateCategory(item.id, newName.trim());
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
  }
  async function remove(item: Category) {
    await deleteCategory(item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  }

  return (
    <div>
      <h2>Categories</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={add}>Add</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
        {items.map(c => <Row key={c.id} category={c} onSave={save} onDelete={remove} />)}
      </ul>
    </div>
  );
}

function Row({ category, onSave, onDelete }: { category: Category; onSave: (c: Category, n: string) => void | Promise<void>; onDelete: (c: Category) => void | Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  return (
    <li style={{ border: '1px solid #ddd', padding: 8, borderRadius: 6 }}>
      {!editing ? (<span>{category.name}</span>) : (<input value={name} onChange={e => setName(e.target.value)} />)}
      <span style={{ marginLeft: 8 }}>
        {!editing ? (
          <>
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={() => onDelete(category)}>Delete</button>
          </>
        ) : (
          <>
            <button onClick={() => { onSave(category, name); setEditing(false); }}>Save</button>
            <button onClick={() => { setEditing(false); setName(category.name); }}>Cancel</button>
          </>
        )}
      </span>
    </li>
  );
}


