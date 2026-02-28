import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import ResponsiveLogo from './ResponsiveLogo';
import Alert from '../components/Alert';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const [otpValid, setOtpValid] = useState(false);
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const otpFromUrl = urlParams.get('otp');
    if (otpFromUrl) setOtp(otpFromUrl);
  }, [location]);

  useEffect(() => {
    setOtpValid(otp.length === 4 && /^[0-9]{4}$/.test(otp));
  }, [otp]);

  const handleVerifyOtp = async () => {
    setLoading(true);
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    if (!token) {
      setAlert({ message: 'No token found. Please log in again.', type: 'error' });
      setLoading(false);
      return;
    }
    try {
      const { id: userId } = jwtDecode(token);
      const response = await axios.get(`${apiUrl}/api/users/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      const email = response.data.email;
      await axios.post(`${apiUrl}/api/user/verify-otp-for-pin-reset`, { email, otp });
      setAlert({ message: 'OTP verified!', type: 'success' });
      setTimeout(() => navigate('/reset-pin', { state: { otp } }), 2000);
    } catch (err) {
      setAlert({ message: err.response?.data?.message || 'OTP verification failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0A0F1E 0%,#0F172A 60%,#111827 100%)', padding:'1.5rem', position:'relative', overflow:'hidden' },
    glowA: { position:'absolute', top:'-100px', left:'-100px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle,rgba(245,166,35,0.1) 0%,transparent 70%)', pointerEvents:'none' },
    glowB: { position:'absolute', bottom:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle,rgba(245,166,35,0.07) 0%,transparent 70%)', pointerEvents:'none' },
    card: { position:'relative', width:'100%', maxWidth:'420px', background:'rgba(15,23,42,0.85)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(245,166,35,0.15)', borderRadius:'20px', padding:'2.5rem 2rem', boxShadow:'0 24px 64px rgba(0,0,0,0.5)', textAlign:'center' },
    logoRow: { display:'flex', alignItems:'center', marginBottom:'2rem' },
    logoInner: { display:'flex', alignItems:'center', gap:'0.6rem' },
    logoText: { color:'#F5A623', fontWeight:700, fontSize:'1rem', letterSpacing:'0.06em' },
    badge: { display:'inline-block', background:'rgba(245,166,35,0.12)', border:'1px solid rgba(245,166,35,0.3)', color:'#F5A623', borderRadius:'50px', padding:'0.3rem 0.9rem', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.8rem' },
    heading: { color:'#E2E8F0', fontSize:'1.6rem', fontWeight:800, margin:'0 0 1.4rem' },
    sub: { color:'#64748B', fontSize:'0.88rem', marginBottom:'1.6rem' },
    input: { width:'100%', padding:'0.85rem 1rem', background:'rgba(255,255,255,0.05)', border: focused ? '1px solid rgba(245,166,35,0.6)' : '1px solid rgba(30,41,59,0.9)', borderRadius:'10px', color:'#E2E8F0', fontSize:'1.2rem', outline:'none', boxSizing:'border-box', marginBottom:'1.2rem', textAlign:'center', letterSpacing:'0.3em', transition:'border-color 0.2s' },
    btn: { width:'100%', padding:'0.85rem', background: loading || !otpValid ? 'rgba(245,166,35,0.35)' : 'linear-gradient(135deg,#F5A623,#FBBF24)', color: loading || !otpValid ? 'rgba(0,0,0,0.4)' : '#0A0F1E', border:'none', borderRadius:'50px', fontWeight:800, fontSize:'0.95rem', cursor: loading || !otpValid ? 'not-allowed' : 'pointer', letterSpacing:'0.04em' },
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
        </div>

        <div style={s.badge}>🔐 OTP Verification</div>
        <h2 style={s.heading}>Verify OTP</h2>
        <p style={s.sub}>Enter the 4-digit code sent to your email.</p>

        {alert.message && <Alert message={alert.message} type={alert.type} />}

        <input
          type="text"
          placeholder="• • • •"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          disabled={loading}
          maxLength={4}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={s.input}
        />

        <button onClick={handleVerifyOtp} disabled={loading || !otpValid} style={s.btn}>
          {loading ? 'Verifying…' : 'Verify OTP →'}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
