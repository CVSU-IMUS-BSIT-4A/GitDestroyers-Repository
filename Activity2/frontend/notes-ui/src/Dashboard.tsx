import type { FormEvent } from 'react';
import { useEffect, useState, useRef } from 'react';
import { createNote, deleteNote, fetchNotes, setAuth, updateNote, fetchTrashedNotes, restoreNote, deleteNotePermanent } from './api';
import type { Note } from './api';
import './notes.css';
import Account from './Account';

type Props = { token: string; onLogout: () => void };

export default function Dashboard({ token, onLogout }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [folder, setFolder] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterFolder, setFilterFolder] = useState<string | null>(null);
  const [showAccount, setShowAccount] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutClosing, setLogoutClosing] = useState(false);
  const [view, setView] = useState<'active' | 'trash'>('active');

  useEffect(() => {
    setAuth(token);
    (async () => {
      if (view === 'trash') setNotes(await fetchTrashedNotes());
      else setNotes(await fetchNotes());
    })();
  }, [token, view]);

  // focus management & escape handling for modal
  useEffect(() => {
    if (!showAccount) return;
    prevActiveRef.current = document.activeElement as HTMLElement | null;
    const modalEl = modalRef.current;
    if (!modalEl) return;
    // focus first focusable element
    const focusable = modalEl.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setModalClosing(true);
        setTimeout(()=>{ setShowAccount(false); setModalClosing(false); }, 220);
        return;
      }
      if (e.key === 'Tab') {
        // trap focus within modal
        const nodes = Array.from(focusable).filter(Boolean) as HTMLElement[];
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      // restore focus
      prevActiveRef.current?.focus?.();
    };
  }, [showAccount]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const created = await createNote(title.trim(), content.trim() || undefined, category.trim() || undefined, folder.trim() || undefined);
    setNotes(prev => [created, ...prev]);
    setTitle('');
    setContent('');
    setCategory('');
    setFolder('');
  }

  async function handleUpdate(n: Note, t: string, c?: string, category?: string, folder?: string) {
    const updated = await updateNote(n.id, { title: t, content: c, category, folder });
    setNotes(prev => prev.map(x => (x.id === n.id ? updated : x)));
  }

  async function handleDelete(n: Note) {
    if (view === 'trash') {
      // permanent delete from trash
      await deleteNotePermanent(n.id);
      setNotes(prev => prev.filter(x => x.id !== n.id));
    } else {
      await deleteNote(n.id);
      setNotes(prev => prev.filter(x => x.id !== n.id));
    }
  }

  async function handleRestore(n: Note) {
    await restoreNote(n.id);
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
          {/* header actions removed per request */}
        </div>
      </div>

      {showAccount && (
        <div className={`modal-overlay ${modalClosing ? '' : 'modal-fade-in'}`} onClick={() => { setModalClosing(true); setTimeout(()=>{ setShowAccount(false); setModalClosing(false); }, 220); }}>
          <div ref={modalRef} className={`modal ${modalClosing ? 'modal-exit' : 'modal-enter'}`} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setModalClosing(true); setTimeout(()=>{ setShowAccount(false); setModalClosing(false); }, 220); }}>✕</button>
            <Account />
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className={`modal-overlay ${logoutClosing ? '' : 'modal-fade-in'}`} onClick={() => { setLogoutClosing(true); setTimeout(()=>{ setShowLogoutConfirm(false); setLogoutClosing(false); }, 220); }}>
          <div className={`modal ${logoutClosing ? 'modal-exit' : 'modal-enter'}`} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Logout</h3>
            </div>
            <div className="modal-body">Are you sure you want to log out?</div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setLogoutClosing(true); setTimeout(()=>{ setShowLogoutConfirm(false); setLogoutClosing(false); }, 180); }}>Cancel</button>
              <button autoFocus className="btn-danger-filled btn btn-sm" onClick={() => { setAuth(null); setShowLogoutConfirm(false); onLogout(); }}>Logout</button>
            </div>
          </div>
        </div>
      )}

      <div className="notes-main">
        <div className="notes-top-bar">
          <div className="notes-count-above">
            <div className="notes-count">{notes.length} notes</div>
          </div>
          <div className="notes-header-right">
            <button className="btn btn-ghost" onClick={() => { if (!showAccount) setShowAccount(true); else { setModalClosing(true); setTimeout(()=>{ setShowAccount(false); setModalClosing(false); }, 220); } }}>{showAccount ? 'Close' : 'Account'}</button>
            <button
              className="btn btn-ghost"
              onClick={() => setShowLogoutConfirm(true)}
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="notes-toolbar-wrapper">
          <div className="notes-toolbar notes-toolbar-full">
            <input className="notes-search" placeholder="Search notes by title or content..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} aria-label="Search notes" />
            <select className="filter-select" value={filterCategory ?? ''} onChange={e => setFilterCategory(e.target.value || null)} aria-label="Filter by category">
          <option value="">All categories</option>
          {[...new Set(notes.map(n => n.category).filter(Boolean) as string[])].map(c => (
            <option key={String(c)} value={String(c)}>{String(c)}</option>
          ))}
        </select>
        <select className="filter-select" value={filterFolder ?? ''} onChange={e => setFilterFolder(e.target.value || null)} aria-label="Filter by folder">
          <option value="">All folders</option>
          {[...new Set(notes.map(n => n.folder).filter(Boolean) as string[])].map(f => (
            <option key={String(f)} value={String(f)}>{String(f)}</option>
          ))}
        </select>
          </div>
        </div>
        {/* removed toolbar trash button - moved under the form */}

  <form onSubmit={handleAdd} className="notes-form">
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} aria-label="Note title" />
        <input placeholder="Category (optional)" value={category} onChange={e => setCategory(e.target.value)} aria-label="Note category" />
        <input placeholder="Folder (optional)" value={folder} onChange={e => setFolder(e.target.value)} aria-label="Note folder" />
        <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} rows={3} aria-label="Note content" />
        <button type="submit" className="btn btn-primary btn-sm">Add</button>
        <div className="view-toggle-wrapper">
          <button type="button" className="btn btn-ghost" onClick={() => { setView(v => v === 'active' ? 'trash' : 'active'); setNotes([]); }}>
            {view === 'active' ? 'View Trash' : 'View Active'}
          </button>
        </div>
      </form>

      <div className="notes-list-wrapper">
        <ul className="notes-list">
        {notes
          .filter(n => {
            if (filterCategory && n.category !== filterCategory) return false;
            if (filterFolder && n.folder !== filterFolder) return false;
            if (!searchTerm.trim()) return true;
            const s = searchTerm.toLowerCase();
            return n.title.toLowerCase().includes(s) || (n.content ?? '').toLowerCase().includes(s) || (n.category ?? '').toLowerCase().includes(s) || (n.folder ?? '').toLowerCase().includes(s);
          })
          .map(n => (
            <NoteItem key={n.id} note={n} view={view} onUpdate={handleUpdate} onDelete={handleDelete} onRestore={handleRestore} />
          ))}
        </ul>
      </div>
    </div>
  </div>
  );
}

function NoteItem({ note, view, onUpdate, onDelete, onRestore }: { note: Note; view: 'active' | 'trash'; onUpdate: (n: Note, t: string, c?: string, category?: string, folder?: string) => void | Promise<void>; onDelete: (n: Note) => void | Promise<void>; onRestore: (n: Note) => void | Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content ?? '');
  const [category, setCategory] = useState(note.category ?? '');
  const [folder, setFolder] = useState(note.folder ?? '');
  return (
    <li className="note-card">
      {!editing ? (
        <div>
          <div className="note-title">{note.title}</div>
          {note.content && <div className="note-content">{note.content}</div>}
          {(note.category || note.folder) && (
            <div className="note-metadata">
              {note.category && <span>Category: {note.category}</span>}
              {note.folder && <span>Folder: {note.folder}</span>}
            </div>
          )}
        </div>
      ) : (
        <div className="edit-group">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" aria-label="Edit note title" />
          <input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} aria-label="Edit note category" />
          <input placeholder="Folder" value={folder} onChange={e => setFolder(e.target.value)} aria-label="Edit note folder" />
          <textarea rows={2} value={content} onChange={e => setContent(e.target.value)} placeholder="Content" aria-label="Edit note content" />
        </div>
      )}
      <div className="note-actions">
          {!editing ? (
          <>
            <button onClick={() => setEditing(true)} className="btn btn-ghost">Edit</button>
            {view === 'trash' ? (
              <>
                <button onClick={() => onRestore(note)} className="btn btn-primary">Restore</button>
                <button onClick={() => onDelete(note)} className="btn btn-danger">Delete Permanently</button>
              </>
            ) : (
              <button onClick={() => onDelete(note)} className="btn btn-danger">Delete</button>
            )}
          </>
        ) : (
          <>
            <button onClick={() => { onUpdate(note, title.trim(), content.trim() || undefined, category.trim() || undefined, folder.trim() || undefined); setEditing(false); }} className="btn btn-primary">Save</button>
            <button onClick={() => { setEditing(false); setTitle(note.title); setContent(note.content ?? ''); }} className="btn btn-ghost">Cancel</button>
          </>
        )}
      </div>
    </li>
  );
}


