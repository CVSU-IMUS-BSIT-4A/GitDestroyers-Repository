import { FormEvent, useState } from 'react';
import { login, register, setAuth } from './api';

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
    <div style={{ maxWidth: 400, margin: '10vh auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
      </form>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}


