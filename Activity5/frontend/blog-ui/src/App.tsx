import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import {
  addComment,
  createPost,
  listPosts,
  loadTokenFromStorage,
  login,
  register,
  setAuthToken,
  type Post,
  getCurrentUserIdFromToken,
  getUser,
  updateUser,
  deleteUser,
} from './api';

function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'register') {
        await register(email, name, password);
        setSuccess('Registration successful. Redirecting to login...');
        setTimeout(() => {
          setMode('login');
          setSuccess(null);
        }, 1000);
      } else {
        const { accessToken } = await login(email, password);
        setAuthToken(accessToken);
        navigate('/');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed');
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          <div>Email</div>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </label>
        {mode === 'register' && (
          <label>
            <div>Name</div>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </label>
        )}
        <label>
          <div>Password</div>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </label>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        {success && <div style={{ color: 'green' }}>{success}</div>}
        <button type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
      </form>
      <div style={{ marginTop: 12 }}>
        {mode === 'login' ? (
          <button onClick={() => setMode('register')}>Create account</button>
        ) : (
          <button onClick={() => setMode('login')}>I have an account</button>
        )}
      </div>
    </div>
  );
}

function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const userId = getCurrentUserIdFromToken();
  const [editingPost, setEditingPost] = useState<Record<number, { title: string; content: string } | null>>({});
  const [editingComment, setEditingComment] = useState<Record<number, string>>({});

  async function load() {
    try {
      const data = await listPosts(page, pageSize);
      setPosts(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setPosts([]);
    }
  }

  useEffect(() => {
    loadTokenFromStorage();
  }, []);

  useEffect(() => {
    load();
  }, [page]);

  async function handleCreate() {
    if (!title || !content) return;
    const p = await createPost(title, content);
    setTitle('');
    setContent('');
    setPosts(prev => [p, ...prev]);
  }

  async function handleAddComment(postId: number) {
    const text = commentText[postId];
    if (!text) return;
    const newComment = await addComment(postId, text);
    setCommentText(prev => ({ ...prev, [postId]: '' }));
    // append the new comment locally so it shows immediately
    setPosts(prev => prev.map(p => (
      p.id === postId
        ? { ...p, comments: [ ...(p.comments || []), newComment ] }
        : p
    )));
  }

  return (
    <div style={{ maxWidth: 720, margin: '24px auto', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Posts</h2>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/user">User</Link>
          <button onClick={() => { setAuthToken(null); window.location.href = '/auth'; }}>Logout</button>
        </nav>
      </header>

      <section style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <h3>Create Post</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} />
          <button onClick={handleCreate}>Post</button>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        {(posts || []).map(p => {
          const allComments = p.comments || [];
          const isExpanded = !!expanded[p.id];
          const visible = isExpanded ? allComments : allComments.slice(0, 3);
          const hasMore = allComments.length > 3 && !isExpanded;
          return (
            <div key={p.id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
              {editingPost[p.id] ? (
                <div style={{ display: 'grid', gap: 6 }}>
                  <input
                    value={editingPost[p.id]!.title}
                    onChange={e => setEditingPost(prev => ({ ...prev, [p.id]: { ...prev[p.id]!, title: e.target.value } }))}
                  />
                  <textarea
                    value={editingPost[p.id]!.content}
                    onChange={e => setEditingPost(prev => ({ ...prev, [p.id]: { ...prev[p.id]!, content: e.target.value } }))}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={async () => {
                      const data = editingPost[p.id]!;
                      const updated = await (await import('./api')).updatePost(p.id, data);
                      setPosts(prev => prev.map(pp => pp.id === p.id ? updated : pp));
                      setEditingPost(prev => ({ ...prev, [p.id]: null }));
                    }}>Save</button>
                    <button onClick={() => setEditingPost(prev => ({ ...prev, [p.id]: null }))}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 18, fontWeight: 600 }}>{p.title}</div>
              )}
              <div style={{ color: '#555' }}>by {p.author?.name || p.author?.email || 'Unknown'}</div>
              {!editingPost[p.id] && (
                <div style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{p.content}</div>
              )}
              {allComments.length > 0 && (
                <div style={{ marginTop: 8, borderTop: '1px solid #eee', paddingTop: 8 }}>
                  {visible.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{c.author?.name || c.author?.email || 'Unknown'}:</span>
                      {editingComment[c.id] !== undefined ? (
                        <>
                          <input style={{ flex: 1 }} value={editingComment[c.id]}
                                 onChange={e => setEditingComment(prev => ({ ...prev, [c.id]: e.target.value }))} />
                          <button onClick={async () => {
                            const updated = await (await import('./api')).updateComment(c.id, { text: editingComment[c.id] });
                            setPosts(prev => prev.map(pp => pp.id === p.id ? {
                              ...pp,
                              comments: (pp.comments || []).map(cc => cc.id === c.id ? updated : cc)
                            } : pp));
                            setEditingComment(prev => { const copy = { ...prev }; delete copy[c.id]; return copy; });
                          }}>Save</button>
                          <button onClick={() => setEditingComment(prev => { const copy = { ...prev }; delete copy[c.id]; return copy; })}>Cancel</button>
                        </>
                      ) : (
                        <span style={{ flex: 1 }}>{c.text}</span>
                      )}
                      {c.author && userId === c.author.id && editingComment[c.id] === undefined && (
                        <>
                          <button onClick={() => setEditingComment(prev => ({ ...prev, [c.id]: c.text }))}>Edit</button>
                          <button onClick={async () => {
                            await (await import('./api')).deleteComment(c.id);
                            setPosts(prev => prev.map(pp => pp.id === p.id ? {
                              ...pp,
                              comments: (pp.comments || []).filter(cc => cc.id !== c.id)
                            } : pp));
                          }}>Delete</button>
                        </>
                      )}
                    </div>
                  ))}
                  {hasMore && (
                    <button style={{ marginTop: 4 }} onClick={() => setExpanded(prev => ({ ...prev, [p.id]: true }))}>See more…</button>
                  )}
                </div>
              )}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                placeholder="Add a comment"
                value={commentText[p.id] || ''}
                onChange={e => setCommentText(prev => ({ ...prev, [p.id]: e.target.value }))}
              />
              <button onClick={() => handleAddComment(p.id)}>Comment</button>
            </div>
            {p.author && userId === p.author.id && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {!editingPost[p.id] && <button onClick={() => setEditingPost(prev => ({ ...prev, [p.id]: { title: p.title, content: p.content } }))}>Edit post</button>}
                <button onClick={async () => {
                  await (await import('./api')).deletePost(p.id);
                  setPosts(prev => prev.filter(pp => pp.id !== p.id));
                }}>Delete post</button>
              </div>
            )}
          </div>
          );
        })}
      </section>

      <footer style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)}>Next</button>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Protected><PostsPage /></Protected>} />
        <Route path="/user" element={<Protected><UserPage /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  loadTokenFromStorage();
  const uid = getCurrentUserIdFromToken();
  if (!uid) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function UserPage() {
  const uid = getCurrentUserIdFromToken()!;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const u = await getUser(uid);
      setName(u.name || '');
      setEmail(u.email || '');
    })();
  }, [uid]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateUser(uid, { name, email, ...(password ? { password } : {}) });
    setMsg('Profile updated');
    setTimeout(() => setMsg(null), 1000);
  }

  async function handleDelete() {
    await deleteUser(uid);
    setAuthToken(null);
    navigate('/auth');
  }

  return (
    <div style={{ maxWidth: 480, margin: '24px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h2>User</h2>
      <form onSubmit={handleSave} style={{ display: 'grid', gap: 12 }}>
        <label>
          <div>Name</div>
          <input value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label>
          <div>Email</div>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
        </label>
        <label>
          <div>New Password (optional)</div>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
        </label>
        {msg && <div style={{ color: 'green' }}>{msg}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">Save</button>
          <button type="button" onClick={handleDelete} style={{ color: 'crimson' }}>Delete Account</button>
          <Link to="/">Back</Link>
        </div>
      </form>
    </div>
  );
}
