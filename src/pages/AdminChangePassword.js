import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminToken } from '../utils/adminAuth';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:22222';

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: 'linear-gradient(180deg,#f0f7ff 0%, #eef8ff 100%)',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    background: '#ffffff',
    borderRadius: 12,
    padding: 32,
    boxShadow: '0 12px 36px rgba(6,10,30,0.12)',
  },
  title: { margin: '0 0 6px', fontSize: 20, color: '#162660' },
  desc: { margin: '0 0 20px', color: '#475569', fontSize: 13 },
  field: { display: 'flex', flexDirection: 'column', marginBottom: 14 },
  label: { fontSize: 13, color: '#334155', marginBottom: 6 },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    fontSize: 15,
    boxSizing: 'border-box',
    width: '100%',
  },
  button: {
    width: '100%',
    background: '#162660',
    color: '#fff',
    border: 'none',
    padding: '11px 14px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    marginTop: 6,
  },
  msg: (type) => ({
    marginTop: 14,
    padding: '10px 12px',
    borderRadius: 8,
    background: type === 'error' ? '#fff1f2' : '#ecfdf5',
    color: type === 'error' ? '#9b1c1c' : '#065f46',
    fontSize: 14,
  }),
  hint: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
};

export default function AdminChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!currentPassword || !newPassword || !confirmNew) {
      setMessage('All fields are required.');
      setMessageType('error');
      return;
    }
    if (newPassword.length < 8) {
      setMessage('New password must be at least 8 characters.');
      setMessageType('error');
      return;
    }
    if (newPassword !== confirmNew) {
      setMessage('New passwords do not match.');
      setMessageType('error');
      return;
    }

    const token = getAdminToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Password changed successfully! Redirecting to dashboard...');
        setMessageType('success');
        setTimeout(() => navigate('/admin'), 2000);
      } else {
        setMessage(data.message || 'Failed to change password.');
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error N/A please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Change Admin Password</h2>
        <p style={styles.desc}>
          Set a new permanent password. This will remove the temporary-password expiry restriction.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="current-pass">Current Password</label>
            <input
              id="current-pass"
              style={styles.input}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Your current (or temporary) password"
              autoComplete="current-password"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="new-pass">New Password</label>
            <input
              id="new-pass"
              style={styles.input}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <span style={styles.hint}>Minimum 8 characters</span>
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="confirm-pass">Confirm New Password</label>
            <input
              id="confirm-pass"
              style={styles.input}
              type="password"
              value={confirmNew}
              onChange={(e) => setConfirmNew(e.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Change Password'}
          </button>
        </form>

        {message && (
          <div style={styles.msg(messageType)} role="status">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
