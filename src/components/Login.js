import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { requestFcmToken } from "../utils/requestFcmToken";
import ResponsiveLogo from './ResponsiveLogo';


const Login = ({ setUserRole }) => {
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };
  const apiUrl = process.env.REACT_APP_API_URL;

  // const token =
  // localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlertMessage(""); // Clear any previous alert
    setAlertType('error');
    try {
      const response = await axios.post(`${apiUrl}/api/auth/login`, credentials);
      if (response.status === 200) {
        setAlertType('success');
        setAlertMessage("Login successful! Redirecting...");
        const token = response.data.token;
        const decodedToken = jwtDecode(token);

        setUserRole(decodedToken.role);
        localStorage.setItem("jwtToken", token);
        localStorage.setItem("username", decodedToken.username);
        localStorage.removeItem("activeComponent");

        // ✅ Move FCM logic here with fresh token
        try {
          await sendIfNewToken(token);
        } catch (e) {
          console.warn("FCM token not saved:", e.message);
        }

        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        sessionStorage.removeItem("redirectAfterLogin");

        setTimeout(() => {
          setAlertMessage(""); // Auto-dismiss alert after redirect
          navigate(redirectPath || "/dashboard");
        }, 3000);
      }
    } catch (err) {
  setAlertType('error');
  setAlertMessage(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const sendIfNewToken = async (newToken) => {
    // Avoid logging raw tokens or JWT values. Only log non-sensitive diagnostics in dev.
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Login] checking fcm token; hasJwt=', Boolean(newToken));
    }

    const fcmToken = await requestFcmToken();
    const stored = localStorage.getItem("fcmToken");

    if (fcmToken && fcmToken !== stored) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Login] new FCM token detected (value redacted)');
      }

      if (newToken) {
        // Use the fresh token passed from handleSubmit. Do not log token values.
        await axios.post(`${apiUrl}/api/auth/save-fcm-token`, { fcmToken }, {
          headers: { Authorization: `Bearer ${newToken}` },
        });

        localStorage.setItem("fcmToken", fcmToken);
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Login] FCM token saved for user (value redacted)');
        }
      } else {
        console.error('No JWT token found.');
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Login] FCM token not changed, skipping save.');
      }
    }
  };

  
  
  

  const s = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #060c1a 0%, #0a0f1e 55%, #0d1526 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    },
    glow1: {
      position: 'absolute', top: '-10%', left: '-5%',
      width: '50vw', height: '50vw', maxWidth: 600, maxHeight: 600,
      background: 'radial-gradient(ellipse, rgba(245,166,35,0.08) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    glow2: {
      position: 'absolute', bottom: '-5%', right: '-5%',
      width: '35vw', height: '35vw', maxWidth: 400, maxHeight: 400,
      background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    card: {
      width: '100%',
      maxWidth: 420,
      background: 'rgba(15,23,42,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      padding: '40px 36px',
      boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      position: 'relative',
      zIndex: 1,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
    },
    logoWrap: { display: 'flex', alignItems: 'center', gap: 10 },
    logoText: {
      color: '#fff', fontWeight: 900,
      fontSize: '1.1rem', letterSpacing: '1.5px', textTransform: 'uppercase',
    },
    navLinks: { display: 'flex', gap: 16 },
    navLink: {
      color: 'rgba(148,163,184,0.8)', textDecoration: 'none',
      fontSize: '0.82rem', fontWeight: 600,
      transition: 'color 160ms',
    },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(245,166,35,0.10)',
      border: '1px solid rgba(245,166,35,0.3)',
      color: '#F5A623',
      fontSize: 10, fontWeight: 700, letterSpacing: '2px',
      textTransform: 'uppercase',
      padding: '4px 12px', borderRadius: 100,
      marginBottom: 14,
    },
    heading: {
      color: '#fff', fontWeight: 900,
      fontSize: '1.75rem', letterSpacing: '-0.5px',
      margin: '0 0 6px',
    },
    subtext: {
      color: '#64748B', fontSize: '0.85rem',
      margin: '0 0 28px',
    },
    formGroup: { marginBottom: 18 },
    label: {
      display: 'block',
      color: '#94A3B8', fontSize: '0.78rem',
      fontWeight: 700, letterSpacing: '0.8px',
      textTransform: 'uppercase', marginBottom: 7,
    },
    input: (focused) => ({
      width: '100%',
      padding: '11px 14px',
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${focused ? 'rgba(245,166,35,0.6)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 10,
      color: '#E2E8F0',
      fontSize: '0.95rem',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 180ms',
    }),
    btn: (hovered, disabled) => ({
      width: '100%',
      padding: '13px',
      background: disabled ? 'rgba(245,166,35,0.4)' : hovered ? '#FBBF24' : '#F5A623',
      color: '#000',
      fontWeight: 800,
      fontSize: '0.95rem',
      border: 'none',
      borderRadius: 100,
      cursor: disabled ? 'not-allowed' : 'pointer',
      marginTop: 6,
      transition: 'background 180ms, transform 150ms',
      transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
    }),
    divider: {
      display: 'flex', alignItems: 'center', gap: 12,
      margin: '22px 0',
    },
    dividerLine: {
      flex: 1, height: 1,
      background: 'rgba(255,255,255,0.07)',
    },
    dividerText: { color: '#475569', fontSize: '0.75rem', fontWeight: 600 },
    footer: {
      marginTop: 22, textAlign: 'center',
      display: 'flex', flexDirection: 'column', gap: 8,
    },
    footerText: { color: '#64748B', fontSize: '0.82rem' },
    footerLink: {
      color: '#F5A623', textDecoration: 'none',
      fontWeight: 700,
    },
  };

  return (
    <div style={s.page}>
      <div style={s.glow1} />
      <div style={s.glow2} />

      <div style={s.card}>
        {/* Header row */}
        <div style={s.header}>
          <div style={s.logoWrap}>
            <ResponsiveLogo alt="Exdollarium" style={{ height: 34, width: 34, filter: 'brightness(0) invert(1)' }} />
            <span style={s.logoText}>Exdollarium</span>
          </div>
          <div style={s.navLinks}>
            <Link to="/" style={s.navLink}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.8)'}
            >Home</Link>
            <Link to="/signup" style={s.navLink}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.8)'}
            >Sign Up</Link>
          </div>
        </div>

  {alertMessage && <Alert message={alertMessage} type={alertType} onClose={() => setAlertMessage('')} />}

        {/* Title */}
        <div style={s.badge}>&#128274; Secure Login</div>
        <h2 style={s.heading}>Welcome back</h2>
        <p style={s.subtext}>Sign in to your Exdollarium account</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={s.formGroup}>
            <label style={s.label}>Username or Email</label>
            <input
              type="text" name="identifier" id="identifier"
              value={credentials.identifier} onChange={handleChange} required
              style={s.input(focusedField === 'identifier')}
              onFocus={() => setFocusedField('identifier')}
              onBlur={() => setFocusedField('')}
            />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Password</label>
            <input
              type="password" name="password" id="password"
              value={credentials.password} onChange={handleChange} required
              style={s.input(focusedField === 'password')}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          <button
            type="submit"
            style={s.btn(isHovered, isLoading)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>OR</span>
          <div style={s.dividerLine} />
        </div>

        {/* Footer links */}
        <div style={s.footer}>
          <p style={s.footerText}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" style={s.footerLink}>Create one free</Link>
          </p>
          <p style={s.footerText}>
            <Link to="/forgot-password" style={s.footerLink}>Forgot password?</Link>
          </p>
          <p style={s.footerText}>
            Didn&apos;t receive the email?{' '}
            <a href="/resend-verification" style={s.footerLink}>Resend verification</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
