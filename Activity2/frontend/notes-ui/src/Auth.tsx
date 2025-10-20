import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { login, register, setAuth, api } from './api';
import './auth.css';

type Props = { onAuthed: (token: string) => void };

export default function Auth({ onAuthed }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverUp, setServerUp] = useState<boolean | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = mode === 'login' ? await login(email, password) : await register(email, password);
      setAuth(token);
      onAuthed(token);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      // Try to show server-provided message when available
      const message = (err as any)?.response?.data?.message || (err as any)?.message || 'Authentication failed';
      setError(String(message));
    }
  }

  // ping server to check availability
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await api.get('/');
        if (mounted) setServerUp(true);
      } catch (e) {
        if (mounted) setServerUp(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="auth-wrap">
      <div className="auth-header">
        <div>
          <h2 className="auth-title">{mode === 'login' ? 'Welcome' : 'Create account'}</h2>
          <div className="auth-sub">{mode === 'login' ? 'Log in to your notes account' : 'Register a new account'}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create account')}</button>
      </form>

      <div style={{ marginTop: 8 }}>
        Server: {serverUp === null ? 'Checking...' : serverUp ? 'Online' : 'Offline'}
      </div>

      <div className="auth-toggle">
        <button className="btn btn-ghost" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}
    </div>
  );
}


