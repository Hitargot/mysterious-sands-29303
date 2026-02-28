import React, { useState } from "react";
import ResponsiveLogo from './ResponsiveLogo';
import axios from "axios";
import Alert from "./Alert";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/auth/forgot-password`, { email });
      setAlert({ type: "success", message: response.data.message || "Reset link sent! Check your inbox." });
      setEmail("");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong";
      setAlert({ type: "error", message: errorMsg });
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 60%, #111827 100%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    },
    glowA: { position:'absolute', top:'-100px', left:'-100px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(245,166,35,0.1) 0%, transparent 70%)', pointerEvents:'none' },
    glowB: { position:'absolute', bottom:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 70%)', pointerEvents:'none' },
    card: {
      position: 'relative',
      width: '100%',
      maxWidth: '420px',
      background: 'rgba(15,23,42,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(245,166,35,0.15)',
      borderRadius: '20px',
      padding: '2.5rem 2rem',
      boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    },
    logoRow: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' },
    logoInner: { display:'flex', alignItems:'center', gap:'0.6rem' },
    logoText: { color:'#F5A623', fontWeight:700, fontSize:'1rem', letterSpacing:'0.06em' },
    navRow: { display:'flex', gap:'1.2rem' },
    navLink: { color:'#94A3B8', textDecoration:'none', fontSize:'0.85rem', fontWeight:500 },
    badge: { display:'inline-block', background:'rgba(245,166,35,0.12)', border:'1px solid rgba(245,166,35,0.3)', color:'#F5A623', borderRadius:'50px', padding:'0.3rem 0.9rem', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.8rem' },
    heading: { color:'#E2E8F0', fontSize:'1.6rem', fontWeight:800, margin:'0 0 0.4rem' },
    sub: { color:'#64748B', fontSize:'0.88rem', marginBottom:'1.8rem', lineHeight:1.6 },
    label: { display:'block', color:'#94A3B8', fontSize:'0.8rem', fontWeight:600, marginBottom:'0.4rem', letterSpacing:'0.04em', textTransform:'uppercase' },
    input: {
      width:'100%', padding:'0.75rem 1rem',
      background:'rgba(255,255,255,0.05)',
      border: focused ? '1px solid rgba(245,166,35,0.6)' : '1px solid rgba(30,41,59,0.9)',
      borderRadius:'10px', color:'#E2E8F0', fontSize:'0.95rem',
      outline:'none', boxSizing:'border-box', marginBottom:'1.4rem',
      transition:'border-color 0.2s',
    },
    btn: {
      width:'100%', padding:'0.85rem',
      background: loading ? 'rgba(245,166,35,0.35)' : 'linear-gradient(135deg,#F5A623,#FBBF24)',
      color: loading ? 'rgba(0,0,0,0.4)' : '#0A0F1E',
      border:'none', borderRadius:'50px', fontWeight:800,
      fontSize:'0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
      letterSpacing:'0.04em', transition:'opacity 0.2s',
    },
    footer: { marginTop:'1.4rem', textAlign:'center' },
    footerText: { color:'#64748B', fontSize:'0.83rem', marginBottom:'0.4rem' },
    footerLink: { color:'#F5A623', textDecoration:'none', fontWeight:600 },
  };

  return (
    <div style={s.page}>
      <div style={s.glowA} /><div style={s.glowB} />
      <div style={s.card}>
        <div style={s.logoRow}>
          <div style={s.logoInner}>
            <ResponsiveLogo alt="Exdollarium" style={{ height: 32, width: 32 }} />
            <span style={s.logoText}>EXDOLLARIUM</span>
          </div>
          <nav style={s.navRow}>
            <Link to="/" style={s.navLink}>Home</Link>
            <Link to="/login" style={s.navLink}>Login</Link>
          </nav>
        </div>

        <div style={s.badge}>🔑 Password Reset</div>
        <h2 style={s.heading}>Forgot Password?</h2>
        <p style={s.sub}>Enter your email and we'll send you a reset link.</p>

        {alert.message && <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type:"", message:"" })} />}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            required
            style={s.input}
          />
          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? "Sending…" : "Send Reset Link →"}
          </button>
        </form>

        <div style={s.footer}>
          <p style={s.footerText}>Remember your password? <Link to="/login" style={s.footerLink}>Login</Link></p>
          <p style={s.footerText}>No account? <Link to="/signup" style={s.footerLink}>Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
