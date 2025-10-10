import { FormEvent, useEffect, useState } from 'react';
import { createNote, deleteNote, fetchNotes, setAuth, updateNote } from './api';
import type { Note } from './api';
import './notes.css';

type Props = { token: string; onLogout: () => void };

export default function Dashboard({ token, onLogout }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="notes-container">
      <div className="notes-header">
        <div>
          <h2 className="notes-title">Your Notes</h2>
          <div className="notes-subtitle">A tidy place to capture thoughts — fast and beautiful.</div>
        </div>
        <div className="notes-header-right">
          <div className="notes-count">{notes.length} notes</div>
          <button
            className="btn-ghost"
            onClick={() => {
              setAuth(null);
              onLogout();
            }}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="notes-toolbar">
        <input className="notes-search" placeholder="Search notes by title or content..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <form onSubmit={handleAdd} className="notes-form">
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} rows={3} />
        <button type="submit">Add</button>
      </form>

      <ul className="notes-list">
        {notes
          .filter(n => {
            if (!searchTerm.trim()) return true;
            const s = searchTerm.toLowerCase();
            return n.title.toLowerCase().includes(s) || (n.content ?? '').toLowerCase().includes(s);
          })
          .map(n => (
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
    <li className="note-card">
      {!editing ? (
        <div>
          <div className="note-title">{note.title}</div>
          {note.content && <div className="note-content">{note.content}</div>}
        </div>
      ) : (
        <div className="edit-group">
          <input value={title} onChange={e => setTitle(e.target.value)} />
          <textarea rows={2} value={content} onChange={e => setContent(e.target.value)} />
        </div>
      )}
      <div className="note-actions">
        {!editing ? (
          <>
            <button onClick={() => setEditing(true)} className="">Edit</button>
            <button onClick={() => onDelete(note)}>Delete</button>
          </>
        ) : (
          <>
            <button onClick={() => { onUpdate(note, title.trim(), content.trim() || undefined); setEditing(false); }} className="primary">Save</button>
            <button onClick={() => { setEditing(false); setTitle(note.title); setContent(note.content ?? ''); }}>Cancel</button>
          </>
        )}
      </div>
    </li>
  );
}


