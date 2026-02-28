import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import ResponsiveLogo from './ResponsiveLogo';
import Alert from '../components/Alert';
import { FaLockOpen } from 'react-icons/fa';

const apiUrl = process.env.REACT_APP_API_URL;

const G = {
  navy: '#0A0F1E', navy2: '#0F172A',
  gold: '#F5A623', goldLight: '#FBBF24',
  white: '#F1F5F9', slate: '#94A3B8', slateD: '#64748B',
};

const ResetPinPage = () => {
  const [newPin, setNewPin] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { state } = useLocation();
  const otp = state?.otp;
  const navigate = useNavigate();

  const handleResetPin = async () => {
    if (!otp) {
      setAlert({ message: 'OTP is missing. Please restart the reset flow.', type: 'error' });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

    if (!token) {
      setAlert({ message: 'Session expired. Please log in again.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const { id: userId } = decoded;

      const response = await axios.get(`${apiUrl}/api/users/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      const email = response.data.email;

      await axios.post(
        `${apiUrl}/api/user/reset-pin`,
        { email, otp, newPin },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      setAlert({ message: 'PIN reset successfully! Redirecting…', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setAlert({ message: err.response?.data?.message || 'PIN reset failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, #060c1a 0%, ${G.navy} 55%, #0d1526 100%)`,
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', maxWidth: 600, maxHeight: 600, background: 'radial-gradient(ellipse, rgba(245,166,35,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: '35vw', height: '35vw', maxWidth: 400, maxHeight: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: '40px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <ResponsiveLogo alt="Exdollarium" style={{ height: 34, width: 34, filter: 'brightness(0) invert(1)' }} />
          <span style={{ color: G.white, fontWeight: 900, fontSize: '1.05rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Exdollarium
          </span>
        </div>

        {alert.message && (
          <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: '', type: '' })} />
        )}

        {/* Title */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(245,166,35,0.10)', border: '1px solid rgba(245,166,35,0.3)',
          color: G.gold, fontSize: 10, fontWeight: 700, letterSpacing: '2px',
          textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, marginBottom: 14,
        }}>
          <FaLockOpen style={{ fontSize: 10 }} /> Withdrawal PIN
        </div>
        <h2 style={{ margin: '0 0 6px', color: G.white, fontWeight: 900, fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
          Set New PIN
        </h2>
        <p style={{ margin: '0 0 28px', color: G.slateD, fontSize: '0.85rem' }}>
          Enter a new 4-digit withdrawal PIN for your account.
        </p>

        {/* Input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: G.slate, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>
            New 4-digit PIN
          </label>
          <input
            type="password"
            maxLength={4}
            inputMode="numeric"
            placeholder="••••"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={loading}
            style={{
              width: '100%', padding: '11px 14px', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${focused ? 'rgba(245,166,35,0.6)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 10, color: G.white, fontSize: '1.1rem',
              outline: 'none', letterSpacing: '0.3em',
              transition: 'border-color 180ms',
            }}
          />
        </div>

        {/* Button */}
        <button
          onClick={handleResetPin}
          disabled={loading || newPin.length < 4}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: '100%', padding: '13px',
            background: (loading || newPin.length < 4) ? 'rgba(245,166,35,0.4)' : hovered ? G.goldLight : G.gold,
            color: '#000', fontWeight: 800, fontSize: '0.95rem',
            border: 'none', borderRadius: 100,
            cursor: (loading || newPin.length < 4) ? 'not-allowed' : 'pointer',
            transition: 'background 180ms, transform 150ms',
            transform: hovered && !loading && newPin.length >= 4 ? 'translateY(-1px)' : 'none',
          }}
        >
          {loading ? 'Resetting…' : 'Reset PIN'}
        </button>
      </div>
    </div>
  );
};

export default ResetPinPage;

