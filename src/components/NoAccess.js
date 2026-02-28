import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaHome } from 'react-icons/fa';

const G = {
  navy: '#0A0F1E', navy2: '#0F172A',
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.18)',
  white: '#F1F5F9', slate: '#94A3B8', slateD: '#64748B',
};

const NoAccess = () => {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, #060c1a 0%, ${G.navy} 55%, #0d1526 100%)`,
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: '50vw', height: '50vw', maxWidth: 600, maxHeight: 600,
        background: 'radial-gradient(ellipse, rgba(245,166,35,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-5%', right: '-5%',
        width: '35vw', height: '35vw', maxWidth: 400, maxHeight: 400,
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 440,
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: '44px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        position: 'relative', zIndex: 1, textAlign: 'center',
      }}>

        {/* Icon */}
        <div style={{
          width: 76, height: 76, borderRadius: '50%',
          background: G.goldFaint, border: `2px solid ${G.goldBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '1.9rem', color: G.gold,
        }}>
          <FaLock />
        </div>

        {/* 403 label */}
        <div style={{
          display: 'inline-block',
          background: G.goldFaint, color: G.gold,
          border: `1px solid ${G.goldBorder}`,
          borderRadius: 20, padding: '3px 14px',
          fontSize: '0.72rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          marginBottom: 14,
        }}>
          403 — Forbidden
        </div>

        <h1 style={{ margin: '0 0 10px', color: G.white, fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
          Access Denied
        </h1>
        <p style={{ margin: '0 0 30px', color: G.slate, fontSize: '0.88rem', lineHeight: 1.65 }}>
          You don't have the necessary permissions to view this page. If you believe this is a mistake, please contact support.
        </p>

        {/* CTA */}
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <button
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: G.gold, color: '#000',
              border: 'none', borderRadius: 100,
              padding: '12px 28px', fontSize: '0.9rem', fontWeight: 800,
              cursor: 'pointer', letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = G.goldLight; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = G.gold; e.currentTarget.style.transform = 'none'; }}
          >
            <FaHome style={{ fontSize: 14 }} />
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NoAccess;

