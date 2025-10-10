import { FormEvent, useState } from 'react';
import { login, register, setAuth } from './api';
import './auth.css';

type Props = { onAuthed: (token: string) => void };

export default function Auth({ onAuthed }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const token = mode === 'login' ? await login(email, password) : await register(email, password);
      setAuth(token);
      onAuthed(token);
    } catch (err) {
      setError('Authentication failed');
    }
  }

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
        <button type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
      </form>

      <div className="auth-toggle">
        <button className="ghost" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}
    </div>
  );
}


