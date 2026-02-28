import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { FaEye, FaEyeSlash, FaLock, FaUndo } from 'react-icons/fa';

const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.18)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', red: '#F87171', redFaint: 'rgba(248,113,113,0.1)',
};

const WithdrawalPinInput = ({ onPinSubmit, onCancel }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (value.length <= 1 && /^[0-9]$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      if (index < 3 && value !== '') {
        document.getElementById(`pin-input-${index + 1}`).focus();
      }
    } else if (value === '') {
      const newPin = [...pin];
      newPin[index] = '';
      setPin(newPin);
      if (index > 0) document.getElementById(`pin-input-${index - 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      document.getElementById(`pin-input-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pinValue = pin.join('');
    if (pin.every(d => d === '')) { setAlert({ type: 'error', message: 'Please enter your 4-digit PIN' }); return; }
    if (pinValue.length !== 4) { setAlert({ type: 'error', message: 'Please enter a complete 4-digit PIN' }); return; }
    setIsSubmitting(true);
    setAlert(null);
    try {
      if (onPinSubmit) await onPinSubmit(pinValue);
      setPin(['', '', '', '']);
      setIsPasswordVisible(false);
    } catch (err) {
      console.warn('PIN submit handler threw an error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allFilled = pin.every(d => d !== '');

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

      {/* Icon + heading */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: G.goldFaint, border: `1px solid ${G.goldBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        <FaLock style={{ color: G.gold, fontSize: '1.2rem' }} />
      </div>
      <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700, color: G.white }}>
        Withdrawal PIN
      </h3>
      <p style={{ margin: '0 0 20px', color: G.slateD, fontSize: '0.82rem' }}>
        Enter your 4-digit security PIN
      </p>

      {alert && <Alert type={alert.type} message={alert.message} />}

      {/* PIN boxes */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {pin.map((digit, index) => (
          <input
            key={index}
            id={`pin-input-${index}`}
            type={isPasswordVisible ? 'text' : 'password'}
            value={digit}
            onChange={e => handleChange(e, index)}
            onKeyDown={e => handleKeyDown(e, index)}
            maxLength="1"
            onFocus={e => e.target.select()}
            style={{
              width: 48, height: 52, fontSize: '1.4rem', fontWeight: 700,
              textAlign: 'center', borderRadius: 12,
              background: digit ? G.goldFaint : 'rgba(10,15,30,0.7)',
              border: `2px solid ${digit ? G.gold : G.goldBorder}`,
              color: G.white, outline: 'none',
              transition: 'border-color 0.2s, background 0.2s',
              boxShadow: digit ? `0 0 0 3px rgba(245,166,35,0.12)` : 'none',
            }}
            placeholder="•"
          />
        ))}
      </div>

      {/* Toggle visibility */}
      <button
        type="button"
        onClick={() => setIsPasswordVisible(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: G.slateD, fontSize: '0.82rem', marginBottom: 20,
        }}
      >
        {isPasswordVisible ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        {isPasswordVisible ? 'Hide PIN' : 'Show PIN'}
      </button>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !allFilled}
        style={{
          width: '100%', padding: '13px', borderRadius: 12, border: 'none',
          background: isSubmitting || !allFilled
            ? 'rgba(100,116,139,0.25)'
            : `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
          color: isSubmitting || !allFilled ? G.slateD : G.navy,
          fontSize: '0.95rem', fontWeight: 800,
          cursor: isSubmitting || !allFilled ? 'not-allowed' : 'pointer',
          boxShadow: (!isSubmitting && allFilled) ? '0 4px 16px rgba(245,166,35,0.3)' : 'none',
          transition: 'all 0.2s', marginBottom: 10,
        }}
      >
        {isSubmitting ? 'Verifying\u2026' : 'Confirm Withdrawal'}
      </button>

      {/* Cancel */}
      <button
        type="button"
        onClick={() => { if (!isSubmitting && onCancel) onCancel(); }}
        disabled={isSubmitting}
        style={{
          width: '100%', padding: '11px', borderRadius: 12,
          background: 'transparent', border: `1px solid ${G.goldBorder}`,
          color: G.slate, fontSize: '0.88rem', fontWeight: 600,
          cursor: isSubmitting ? 'not-allowed' : 'pointer', marginBottom: 16,
        }}
      >
        Cancel
      </button>

      {/* Reset PIN */}
      <button
        type="button"
        onClick={() => navigate('/request-otp')}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'none', border: 'none', cursor: 'pointer',
          color: G.slateD, fontSize: '0.8rem', textDecoration: 'none',
        }}
      >
        <FaUndo size={11} /> Forgot PIN? Reset it
      </button>
    </form>
  );
};

export default WithdrawalPinInput;
