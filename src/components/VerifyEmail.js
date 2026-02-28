import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ResponsiveLogo from './ResponsiveLogo';
import Alert from '../components/Alert';

const s = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0A0F1E 0%,#0F172A 60%,#111827 100%)', padding:'1.5rem', position:'relative', overflow:'hidden' },
  glowA: { position:'absolute', top:'-100px', left:'-100px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle,rgba(245,166,35,0.1) 0%,transparent 70%)', pointerEvents:'none' },
  glowB: { position:'absolute', bottom:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle,rgba(245,166,35,0.07) 0%,transparent 70%)', pointerEvents:'none' },
  card: { position:'relative', width:'100%', maxWidth:'420px', background:'rgba(15,23,42,0.85)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(245,166,35,0.15)', borderRadius:'20px', padding:'2.5rem 2rem', boxShadow:'0 24px 64px rgba(0,0,0,0.5)', textAlign:'center' },
  logoRow: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' },
  logoInner: { display:'flex', alignItems:'center', gap:'0.6rem' },
  logoText: { color:'#F5A623', fontWeight:700, fontSize:'1rem', letterSpacing:'0.06em' },
  navRow: { display:'flex', gap:'1.2rem' },
  navLink: { color:'#94A3B8', textDecoration:'none', fontSize:'0.85rem', fontWeight:500 },
  badge: { display:'inline-block', background:'rgba(245,166,35,0.12)', border:'1px solid rgba(245,166,35,0.3)', color:'#F5A623', borderRadius:'50px', padding:'0.3rem 0.9rem', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.8rem' },
  heading: { color:'#E2E8F0', fontSize:'1.6rem', fontWeight:800, margin:'0 0 1.4rem' },
  verifyText: { color:'#94A3B8', fontSize:'0.9rem', marginBottom:'1.2rem' },
  btn: { display:'inline-block', padding:'0.75rem 2rem', background:'linear-gradient(135deg,#F5A623,#FBBF24)', color:'#0A0F1E', border:'none', borderRadius:'50px', fontWeight:800, fontSize:'0.95rem', cursor:'pointer', letterSpacing:'0.04em', textDecoration:'none', marginTop:'0.8rem' },
  btnDisabled: { display:'inline-block', padding:'0.75rem 2rem', background:'rgba(245,166,35,0.3)', color:'rgba(0,0,0,0.4)', border:'none', borderRadius:'50px', fontWeight:800, fontSize:'0.95rem', cursor:'not-allowed', letterSpacing:'0.04em', marginTop:'0.8rem' },
};

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!token) {
      setAlert({ message: 'Invalid verification link.', type: 'error' });
      setLoading(false);
      return;
    }
    const verifyEmail = async () => {
      try {
        await axios.get(`${apiUrl}/api/auth/verify-email?token=${token}`);
        setAlert({ message: 'Email verified successfully! Redirecting to login…', type: 'success' });
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setAlert({ message: error.response?.data?.message || 'Email verification failed.', type: 'error' });
      }
      setLoading(false);
    };
    verifyEmail();
  }, [token, navigate, apiUrl]);

  const handleResendVerification = async () => {
    setIsResendDisabled(true);
    try {
      const email = searchParams.get('email');
      if (!email) {
        setAlert({ message: 'Email not provided. Please sign up again.', type: 'error' });
        setIsResendDisabled(false);
        return;
      }
      await axios.post(`${apiUrl}/api/auth/resend-verification`, { email });
      setAlert({ message: 'Verification email resent. Check your inbox.', type: 'success' });
      setTimeout(() => setIsResendDisabled(false), 30000);
    } catch (error) {
      setAlert({ message: error.response?.data?.message || 'Failed to resend email.', type: 'error' });
      setIsResendDisabled(false);
    }
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

        <div style={s.badge}>✉️ Email Verification</div>
        <h2 style={s.heading}>Verify Your Email</h2>

        {alert.message && <Alert message={alert.message} type={alert.type} />}

        {loading ? (
          <p style={s.verifyText}>Verifying your email…</p>
        ) : alert.type === 'success' ? (
          <Link to="/login" style={s.btn}>Go to Login →</Link>
        ) : (
          <button
            onClick={handleResendVerification}
            disabled={isResendDisabled}
            style={isResendDisabled ? s.btnDisabled : s.btn}
          >
            {isResendDisabled ? 'Resend in 30s' : 'Resend Verification Email'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
