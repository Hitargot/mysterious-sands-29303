import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Alert from '../components/Alert';
import ResponsiveLogo from './ResponsiveLogo';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [focusedField, setFocusedField] = useState('');
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAlert({ message: "Passwords don't match.", type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/api/auth/reset-password/${token}`, { password });
      setAlert({ message: 'Password reset successful! Redirecting to login…', type: 'success' });
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Something went wrong';
      if (errorMessage.includes('invalid') || errorMessage.includes('expired')) {
        setAlert({ message: 'Invalid or expired token. Please try again.', type: 'error' });
      } else {
        setAlert({ message: errorMessage, type: 'error' });
      }
      setPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: focusedField === field ? '1px solid rgba(245,166,35,0.6)' : '1px solid rgba(30,41,59,0.9)',
    borderRadius: '10px', color: '#E2E8F0', fontSize: '0.95rem',
    outline: 'none', boxSizing: 'border-box', marginBottom: '1rem',
    transition: 'border-color 0.2s',
  });

  const s = {
    page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0A0F1E 0%,#0F172A 60%,#111827 100%)', padding:'1.5rem', position:'relative', overflow:'hidden' },
    glowA: { position:'absolute', top:'-100px', left:'-100px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle,rgba(245,166,35,0.1) 0%,transparent 70%)', pointerEvents:'none' },
    glowB: { position:'absolute', bottom:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle,rgba(245,166,35,0.07) 0%,transparent 70%)', pointerEvents:'none' },
    card: { position:'relative', width:'100%', maxWidth:'420px', background:'rgba(15,23,42,0.85)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(245,166,35,0.15)', borderRadius:'20px', padding:'2.5rem 2rem', boxShadow:'0 24px 64px rgba(0,0,0,0.5)' },
    logoRow: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' },
    logoInner: { display:'flex', alignItems:'center', gap:'0.6rem' },
    logoText: { color:'#F5A623', fontWeight:700, fontSize:'1rem', letterSpacing:'0.06em' },
    navRow: { display:'flex', gap:'1.2rem' },
    navLink: { color:'#94A3B8', textDecoration:'none', fontSize:'0.85rem', fontWeight:500 },
    badge: { display:'inline-block', background:'rgba(245,166,35,0.12)', border:'1px solid rgba(245,166,35,0.3)', color:'#F5A623', borderRadius:'50px', padding:'0.3rem 0.9rem', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.8rem' },
    heading: { color:'#E2E8F0', fontSize:'1.6rem', fontWeight:800, margin:'0 0 1.6rem' },
    label: { display:'block', color:'#94A3B8', fontSize:'0.8rem', fontWeight:600, marginBottom:'0.4rem', letterSpacing:'0.04em', textTransform:'uppercase' },
    btn: { width:'100%', padding:'0.85rem', background: loading ? 'rgba(245,166,35,0.35)' : 'linear-gradient(135deg,#F5A623,#FBBF24)', color: loading ? 'rgba(0,0,0,0.4)' : '#0A0F1E', border:'none', borderRadius:'50px', fontWeight:800, fontSize:'0.95rem', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing:'0.04em', marginTop:'0.4rem' },
    footer: { marginTop:'1.4rem', textAlign:'center', color:'#64748B', fontSize:'0.83rem' },
    link: { color:'#F5A623', textDecoration:'none', fontWeight:600 },
  };

  return (
    <div style={s.page}>
      <div style={s.glowA} /><div style={s.glowB} />
      <div style={s.card}>
        <div style={s.logoRow}>
          <div style={s.logoInner}>
            <ResponsiveLogo alt="Exdollarium" style={{ height: 32 }} />
            <span style={s.logoText}>EXDOLLARIUM</span>
          </div>
          <nav style={s.navRow}>
            <Link to="/" style={s.navLink}>Home</Link>
            <Link to="/signup" style={s.navLink}>Signup</Link>
          </nav>
        </div>

        <div style={s.badge}>🔒 Set New Password</div>
        <h2 style={s.heading}>Reset Password</h2>

        {alert.message && <Alert message={alert.message} type={alert.type} />}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>New Password</label>
          <input type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle('password')} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')} />
          <label style={s.label}>Confirm Password</label>
          <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle('confirm')} onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField('')} />
          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? 'Resetting…' : 'Reset Password →'}
          </button>
        </form>

        <div style={s.footer}>
          Remembered your password? <Link to="/login" style={s.link}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
