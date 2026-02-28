import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const VARIANTS = {
  success: {
    bg: 'rgba(15,23,42,0.96)',
    border: 'rgba(52,211,153,0.35)',
    bar: '#34D399',
    icon: <FaCheckCircle />,
    iconColor: '#34D399',
    label: 'Success',
  },
  error: {
    bg: 'rgba(15,23,42,0.96)',
    border: 'rgba(248,113,113,0.35)',
    bar: '#F87171',
    icon: <FaExclamationCircle />,
    iconColor: '#F87171',
    label: 'Error',
  },
  warning: {
    bg: 'rgba(15,23,42,0.96)',
    border: 'rgba(251,191,36,0.35)',
    bar: '#FBBF24',
    icon: <FaExclamationTriangle />,
    iconColor: '#FBBF24',
    label: 'Warning',
  },
  info: {
    bg: 'rgba(15,23,42,0.96)',
    border: 'rgba(99,102,241,0.35)',
    bar: '#818CF8',
    icon: <FaInfoCircle />,
    iconColor: '#818CF8',
    label: 'Info',
  },
};

const Alert = ({ message, type = 'error', duration = 4000, onClose }) => {
  const [visible, setVisible]   = useState(true);
  const [exiting, setExiting]   = useState(false);
  const timerRef = useRef(null);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 280);
  };

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, duration);
    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  if (!visible) return null;

  const v = VARIANTS[type] || VARIANTS.error;

  const toast = (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        minWidth: 300,
        maxWidth: 420,
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: 14,
        boxShadow: '0 16px 48px rgba(0,0,0,0.55)',
        overflow: 'hidden',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateX(32px)' : 'translateX(0)',
        transition: 'opacity 280ms ease, transform 280ms ease',
        animation: exiting ? 'none' : 'alertSlideIn 280ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Body */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 14px 14px 16px' }}>
        {/* Icon */}
        <span style={{
          fontSize: '1.05rem', color: v.iconColor, marginTop: 1, flexShrink: 0,
          filter: `drop-shadow(0 0 6px ${v.iconColor}66)`,
        }}>
          {v.icon}
        </span>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: v.iconColor, fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
            {v.label}
          </div>
          <div style={{ color: '#E2E8F0', fontSize: '0.875rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
            {message}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={dismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#64748B', padding: 0, lineHeight: 1, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: 1,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
        >
          <FaTimes size={13} />
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
        <div style={{
          height: '100%',
          background: `linear-gradient(90deg, ${v.bar}, ${v.bar}99)`,
          width: '100%',
          transformOrigin: 'left',
          animation: `alertProgress ${duration}ms linear forwards`,
        }} />
      </div>

      <style>{`
        @keyframes alertSlideIn {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes alertProgress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );

  return ReactDOM.createPortal(toast, document.body);
};

export default Alert;

