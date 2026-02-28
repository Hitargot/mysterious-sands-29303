import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ResponsiveLogo from './ResponsiveLogo';
import Alert from '../components/Alert';

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,#0A0F1E 0%,#0F172A 60%,#111827 100%)',
    padding: '1.5rem', position: 'relative', overflow: 'hidden',
  },
  glowA: {
    position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px',
    borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,166,35,0.1) 0%,transparent 70%)',
    pointerEvents: 'none',
  },
  glowB: {
    position: 'absolute', bottom: '-80px', right: '-80px', width: '300px', height: '300px',
    borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,166,35,0.07) 0%,transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', width: '100%', maxWidth: '420px',
    background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(245,166,35,0.15)',
    borderRadius: '20px', padding: '2.5rem 2rem', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' },
  logoText: { color: '#F5A623', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em' },
  badge: {
    display: 'inline-block', background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)',
    color: '#F5A623', borderRadius: '50px', padding: '0.35rem 1rem',
    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
    marginBottom: '1rem',
  },
  heading: { color: '#F1F5F9', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.4rem' },
  sub: { color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' },
  label: { display: 'block', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' },
  btn: {
    width: '100%', padding: '0.85rem', borderRadius: '50px', border: 'none',
    background: 'linear-gradient(135deg,#F5A623,#FBBF24)', color: '#0A0F1E',
    fontWeight: 800, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem',
  },
  btnDisabled: {
    width: '100%', padding: '0.85rem', borderRadius: '50px', border: 'none',
    background: 'rgba(245,166,35,0.35)', color: 'rgba(0,0,0,0.4)',
    fontWeight: 800, fontSize: '1rem', cursor: 'not-allowed', marginTop: '0.5rem',
  },
  footer: { marginTop: '1.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' },
  footerLink: { color: '#F5A623', textDecoration: 'none', fontWeight: 600 },
};

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleResend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ message: '', type: '' });
    try {
      const response = await axios.post(`${apiUrl}/api/auth/resend-verification`, { email });
      setAlert({ message: response.data.message, type: 'success' });
      setEmail('');
    } catch (error) {
      setAlert({ message: error.response?.data?.message || 'Failed to resend verification email.', type: 'error' });
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', outline: 'none',
    background: 'rgba(15,23,42,0.9)', color: '#F1F5F9', fontSize: '0.95rem',
    border: focusedField === 'email' ? '1px solid rgba(245,166,35,0.6)' : '1px solid rgba(30,41,59,0.9)',
    transition: 'border 0.2s', boxSizing: 'border-box', marginBottom: '1rem',
  };

  return (
    <div style={s.page}>
      <div style={s.glowA} />
      <div style={s.glowB} />
      <div style={s.card}>
        <div style={s.logoRow}>
          <ResponsiveLogo style={{ height: 32 }} />
          <span style={s.logoText}>EXDOLLARIUM</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={s.badge}>📧 Resend Verification</span>
          <h2 style={s.heading}>Verify Your Account</h2>
          <p style={s.sub}>Enter your email to receive a new verification link.</p>
        </div>

        {alert.message && <Alert message={alert.message} type={alert.type} />}

        <form onSubmit={handleResend}>
          <label style={s.label}>Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField('')}
            required
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={loading ? s.btnDisabled : s.btn}>
            {loading ? 'Sending…' : 'Resend Email →'}
          </button>
        </form>

        <p style={s.footer}>
          Already verified?{' '}
          <Link to="/login" style={s.footerLink}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResendVerification;
