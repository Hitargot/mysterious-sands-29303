import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import ResponsiveLogo from './ResponsiveLogo';
import Alert from '../components/Alert';

const apiUrl = process.env.REACT_APP_API_URL;

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
    textAlign: 'center',
  },
  logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' },
  logoText: { color: '#F5A623', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em' },
  badge: {
    display: 'inline-block', background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)',
    color: '#F5A623', borderRadius: '50px', padding: '0.35rem 1rem',
    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
    marginBottom: '1rem',
  },
  heading: { color: '#F1F5F9', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.4rem' },
  sub: { color: '#64748B', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 },
  btn: {
    width: '100%', padding: '0.85rem', borderRadius: '50px', border: 'none',
    background: 'linear-gradient(135deg,#F5A623,#FBBF24)', color: '#0A0F1E',
    fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
  },
  btnDisabled: {
    width: '100%', padding: '0.85rem', borderRadius: '50px', border: 'none',
    background: 'rgba(245,166,35,0.35)', color: 'rgba(0,0,0,0.4)',
    fontWeight: 800, fontSize: '1rem', cursor: 'not-allowed',
  },
};

const RequestOtpPage = () => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const handleRequestOtp = async () => {
    setLoading(true);
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

    if (!token) {
      setAlert({ message: 'You must be logged in.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const { id: userId } = jwtDecode(token);
      const response = await axios.get(`${apiUrl}/api/users/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const email = response.data.email;

      await axios.post(`${apiUrl}/api/user/send-otp-for-pin-reset`, { email });
      setAlert({ message: 'OTP sent to your email.', type: 'success' });
      setTimeout(() => navigate('/verify-otp'), 2000);
    } catch (err) {
      setAlert({ message: err.response?.data?.message || 'Failed to send OTP.', type: 'error' });
    } finally {
      setLoading(false);
    }
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

        <span style={s.badge}>🔑 Reset Withdrawal PIN</span>
        <h2 style={s.heading}>Request OTP</h2>
        <p style={s.sub}>We'll send a one-time code to your registered email address to verify your identity.</p>

        {alert.message && <Alert message={alert.message} type={alert.type} />}

        <button onClick={handleRequestOtp} disabled={loading} style={loading ? s.btnDisabled : s.btn}>
          {loading ? 'Sending OTP…' : 'Send OTP to Email →'}
        </button>
      </div>
    </div>
  );
};

export default RequestOtpPage;
