import { useEffect, useState } from 'react';
import type { Author } from './api';
import { createAuthor, deleteAuthor, listAuthors, updateAuthor } from './api';

export default function Authors() {
  const [items, setItems] = useState<Author[]>([]);
  const [name, setName] = useState('');

  useEffect(() => { (async () => setItems(await listAuthors()))(); }, []);

  async function add() {
    if (!name.trim()) return;
    const created = await createAuthor(name.trim());
    setItems(prev => [...prev, created]);
    setName('');
  }

  async function save(item: Author, newName: string) {
    const updated = await updateAuthor(item.id, newName.trim());
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
  }

  async function remove(item: Author) {
    await deleteAuthor(item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  }

  return (
    <div>
      <h2>Authors</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={add}>Add</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
        {items.map(a => <Row key={a.id} author={a} onSave={save} onDelete={remove} />)}
      </ul>
    </div>
  );
}

function Row({ author, onSave, onDelete }: { author: Author; onSave: (a: Author, n: string) => void | Promise<void>; onDelete: (a: Author) => void | Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(author.name);
  return (
    <li style={{ border: '1px solid #ddd', padding: 8, borderRadius: 6 }}>
      {!editing ? (<span>{author.name}</span>) : (<input value={name} onChange={e => setName(e.target.value)} />)}
      <span style={{ marginLeft: 8 }}>
        {!editing ? (
          <>
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={() => onDelete(author)}>Delete</button>
          </>
        ) : (
          <>
            <button onClick={() => { onSave(author, name); setEditing(false); }}>Save</button>
            <button onClick={() => { setEditing(false); setName(author.name); }}>Cancel</button>
          </>
        )}
      </span>
    </li>
  );
}


