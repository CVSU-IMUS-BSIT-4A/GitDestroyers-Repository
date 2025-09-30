import { FormEvent, useEffect, useState } from 'react';
import { createNote, deleteNote, fetchNotes, setAuth, updateNote } from './api';
import type { Note } from './api';

type Props = { token: string; onLogout: () => void };

export default function Dashboard({ token, onLogout }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    setAuth(token);
    (async () => setNotes(await fetchNotes()))();
  }, [token]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const created = await createNote(title.trim(), content.trim() || undefined);
    setNotes(prev => [created, ...prev]);
    setTitle('');
    setContent('');
  }

  async function handleUpdate(n: Note, t: string, c?: string) {
    const updated = await updateNote(n.id, { title: t, content: c });
    setNotes(prev => prev.map(x => (x.id === n.id ? updated : x)));
  }

  async function handleDelete(n: Note) {
    await deleteNote(n.id);
    setNotes(prev => prev.filter(x => x.id !== n.id));
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Your Notes</h2>
        <button onClick={onLogout}>Logout</button>
      </div>
      <form onSubmit={handleAdd} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} rows={3} />
        <button type="submit">Add</button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
        {notes.map(n => (
          <NoteItem key={n.id} note={n} onUpdate={handleUpdate} onDelete={handleDelete} />
        ))}
      </ul>
    </div>
  );
}

function NoteItem({ note, onUpdate, onDelete }: { note: Note; onUpdate: (n: Note, t: string, c?: string) => void | Promise<void>; onDelete: (n: Note) => void | Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content ?? '');
  return (
    <li style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
      {!editing ? (
        <div>
          <div style={{ fontWeight: 600 }}>{note.title}</div>
          {note.content && <div style={{ color: '#555' }}>{note.content}</div>}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 6 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} />
          <textarea rows={2} value={content} onChange={e => setContent(e.target.value)} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {!editing ? (
          <>
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={() => onDelete(note)}>Delete</button>
          </>
        ) : (
          <>
            <button onClick={() => { onUpdate(note, title.trim(), content.trim() || undefined); setEditing(false); }}>Save</button>
            <button onClick={() => { setEditing(false); setTitle(note.title); setContent(note.content ?? ''); }}>Cancel</button>
          </>
        )}
      </div>
    </li>
  );
}


