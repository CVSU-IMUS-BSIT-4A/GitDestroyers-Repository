import React, { useEffect, useState } from 'react';
import { changePassword, getCurrentUser } from './api';

export default function Account() {
  const [user, setUser] = useState<{ id: number; email: string; createdAt: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        setUser(u);
      } catch (e) {
        setUser(null);
      }
    })();
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setMessage(err?.response?.data?.message || err?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="account-panel">
      <h3>Account Settings</h3>
      {user ? (
        <div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Joined:</strong> {new Date(user.createdAt).toLocaleString()}</div>
        </div>
      ) : (
        <div>Unable to load user information.</div>
      )}

      <form onSubmit={handleChangePassword} className="account-form">
        <h4>Change password</h4>
        <input type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
        <input type="password" placeholder="New password (min 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Change password'}</button>
      </form>

      {message && <div className="account-message">{message}</div>}
    </div>
  );
}
