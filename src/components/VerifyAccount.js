import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const G = {
  navy: '#0A0F1E', navy2: '#0F172A',
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.18)',
  green: '#34D399', greenFaint: 'rgba(52,211,153,0.12)',
  red: '#F87171', redFaint: 'rgba(248,113,113,0.10)',
  white: '#F1F5F9', slate: '#94A3B8', slateD: '#64748B',
};

const VerifyAccount = () => {
  const [message, setMessage]       = useState('');
  const [status, setStatus]         = useState('loading'); // 'loading' | 'success' | 'error'
  const location  = useLocation();
  const navigate  = useNavigate();
  const apiUrl    = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const verifyAccount = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');

      try {
        const response = await fetch(`${apiUrl}/api/admin/verify?token=${token}`);
        const result   = await response.text();
        setMessage(result);

        if (response.ok) {
          setStatus('success');
          setTimeout(() => navigate('/admin/login'), 3000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        setMessage('Verification failed. Please try again.');
        setStatus('error');
      }
    };

    verifyAccount();
  }, [location, navigate, apiUrl]);

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  const color  = isLoading ? G.goldLight : isSuccess ? G.green   : G.red;
  const faint  = isLoading ? G.goldFaint : isSuccess ? G.greenFaint : G.redFaint;
  const border = isLoading ? G.goldBorder : isSuccess ? 'rgba(52,211,153,0.22)' : 'rgba(248,113,113,0.22)';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, #060c1a 0%, ${G.navy} 55%, #0d1526 100%)`,
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', maxWidth: 600, maxHeight: 600, background: 'radial-gradient(ellipse, rgba(245,166,35,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: '35vw', height: '35vw', maxWidth: 400, maxHeight: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${border}`,
        borderRadius: 20, padding: '44px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        position: 'relative', zIndex: 1, textAlign: 'center',
        transition: 'border-color 400ms',
      }}>

        {/* Icon */}
        <div style={{
          width: 76, height: 76, borderRadius: '50%',
          background: faint, border: `2px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '2rem', color,
        }}>
          {isLoading
            ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
            : isSuccess
              ? <FaCheckCircle />
              : <FaTimesCircle />
          }
        </div>

        {/* Badge */}
        <span style={{
          display: 'inline-block', background: faint, color,
          border: `1px solid ${color}33`, borderRadius: 20,
          padding: '3px 14px', fontSize: '0.72rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
        }}>
          {isLoading ? 'Verifying…' : isSuccess ? 'Verified' : 'Failed'}
        </span>

        <h2 style={{ margin: '0 0 10px', color: G.white, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
          {isLoading ? 'Verifying Account' : isSuccess ? 'Account Verified!' : 'Verification Failed'}
        </h2>

        <p style={{ margin: '0 0 20px', color: G.slate, fontSize: '0.87rem', lineHeight: 1.65 }}>
          {isLoading
            ? 'Please wait while we verify your account…'
            : message || (isSuccess ? 'Your account has been verified successfully.' : 'Something went wrong. Please try again or contact support.')}
        </p>

        {isSuccess && (
          <div style={{
            background: G.greenFaint, border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 10, padding: '10px 16px',
            color: G.green, fontSize: '0.82rem', fontWeight: 600,
          }}>
            Redirecting to login in a moment…
          </div>
        )}
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VerifyAccount;

