import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { getJwtToken } from '../utils/auth';
import Alert from './Alert';
import { FaUser, FaPaperPlane, FaCheckCircle, FaTimesCircle, FaSyncAlt, FaLock, FaStickyNote } from 'react-icons/fa';

// 鈹€鈹€ design tokens 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.1)',
  goldBorder: 'rgba(245,166,35,0.2)', navy: '#0A0F1E', navy2: '#0F172A',
  navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', red: '#F87171', greenFaint: 'rgba(52,211,153,0.1)',
};

const card = {
  background: 'rgba(15,23,42,0.85)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: `1px solid ${G.goldBorder}`,
  borderRadius: '18px',
  padding: '1.6rem',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
};

const inputStyle = (hasErr) => ({
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(10,15,30,0.7)',
  border: `1px solid ${hasErr ? G.red : 'rgba(245,166,35,0.25)'}`,
  borderRadius: '10px', padding: '11px 14px',
  color: G.white, fontSize: '0.92rem',
  outline: 'none', transition: 'border-color 0.2s',
});

const labelStyle = {
  display: 'block', marginBottom: '6px',
  fontSize: '0.75rem', fontWeight: 700,
  color: G.slateD, textTransform: 'uppercase', letterSpacing: '0.07em',
};

const TransferPage = () => {
  const [recipientPayId, setRecipientPayId]   = useState('');
  const [amount, setAmount]                   = useState('');
  const [transferPin, setTransferPin]         = useState('');
  const [note, setNote]                       = useState('');
  const [showAlert, setShowAlert]             = useState(false);
  const [alertMessage, setAlertMessage]       = useState('');
  const [alertType, setAlertType]             = useState('success');
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [recipientInfo, setRecipientInfo]     = useState(null);
  const [isVerifying, setIsVerifying]         = useState(false);
  const [balance, setBalance]                 = useState(null);
  const [errors, setErrors]                   = useState({});
  const [showConfirm, setShowConfirm]         = useState(false);
  const [isMobile, setIsMobile]               = useState(window.innerWidth < 700);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleAlert = (message, type = 'success') => {
    setAlertMessage(message); setAlertType(type); setShowAlert(true);
  };
  const handleCloseAlert = () => setShowAlert(false);

  const verifyPayId = useCallback(async (payId) => {
    if (!payId) { setRecipientInfo(null); return; }
    setIsVerifying(true);
    try {
      const token = getJwtToken();
      if (!token) throw new Error('auth');
      const res = await axios.get(`${apiUrl}/api/users/verify/${payId}`, { headers: { Authorization: `Bearer ${token}` } });
      const user = res.data?.user || null;
      if (user) setRecipientInfo({ ...user, displayName: user.displayName || user.username });
      else setRecipientInfo(null);
    } catch (e) {
      setRecipientInfo(null);
    } finally {
      setIsVerifying(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!recipientPayId) { setRecipientInfo(null); return; }
    const t = setTimeout(() => verifyPayId(recipientPayId), 500);
    return () => clearTimeout(t);
  }, [recipientPayId, verifyPayId]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = getJwtToken();
        if (!token) return;
        const res = await axios.get(`${apiUrl}/api/wallet/data`, { headers: { Authorization: `Bearer ${token}` } });
        setBalance(res.data?.balance ?? null);
      } catch (e) {}
    };
    fetchBalance();
  }, [apiUrl]);

  const handleTransfer = useCallback(async () => {
    const token = getJwtToken();
    if (!token) { handleAlert('You must be logged in to make a transfer.', 'error'); return; }
    const errs = {};
    if (!recipientPayId) errs.recipientPayId = 'Recipient Pay ID is required';
    if (!amount || Number(amount) <= 0) errs.amount = 'Please enter a valid amount';
    if (!transferPin) errs.transferPin = 'PIN is required';
    if (!recipientInfo) errs.recipient = 'Recipient Pay ID is invalid';
    if (balance !== null && Number(amount) > Number(balance)) errs.amount = 'Insufficient balance';
    setErrors(errs);
    if (Object.keys(errs).length) { handleAlert('Please fix validation errors before submitting.', 'error'); return; }
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/wallet/transfer`,
        { recipientPayId, amount: Number(amount), transferPin, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleAlert(response.data.message || 'Transfer successful', 'success');
      setRecipientPayId(''); setRecipientInfo(null); setAmount(''); setTransferPin(''); setNote('');
      try {
        const r = await axios.get(`${apiUrl}/api/wallet/data`, { headers: { Authorization: `Bearer ${token}` } });
        setBalance(r.data?.balance ?? null);
      } catch (e) {}
    } catch (e) {
      handleAlert(e.response?.data?.message || 'Transfer failed.', 'error');
    } finally { setIsSubmitting(false); }
  }, [recipientPayId, amount, transferPin, note, apiUrl, recipientInfo, balance]);

  const amountNumber = Number(amount || 0);
  const canSubmit = !isSubmitting && recipientInfo && amountNumber > 0 && transferPin && transferPin.length >= 4
    && (balance === null || amountNumber <= Number(balance));

  const initials = recipientInfo
    ? (recipientInfo.displayName || recipientInfo.username || '').slice(0, 2).toUpperCase()
    : '';

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 0 32px' }}>

      {/* 鈹€鈹€ Page title 鈹€鈹€ */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: G.white, fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Send Money</h2>
        <p style={{ color: G.slateD, fontSize: '0.82rem', marginTop: 4 }}>Transfer funds to another Exdollarium user instantly.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-start' }}>

        {/* 鈹€鈹€ Left: Recipient 鈹€鈹€ */}
        <div style={{ ...card, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.4rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: G.navy,
            }}>
              <FaUser style={{ fontSize: '0.95rem' }} />
            </div>
            <div>
              <div style={{ color: G.white, fontWeight: 700, fontSize: '0.95rem' }}>Recipient</div>
              <div style={{ color: G.slateD, fontSize: '0.72rem' }}>Search by Pay ID</div>
            </div>
          </div>

          {/* Avatar + name preview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px', marginBottom: '16px',
            background: 'rgba(10,15,30,0.5)', borderRadius: '12px',
            border: `1px solid ${recipientInfo ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.05)'}`,
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: '12px',
              background: recipientInfo
                ? `linear-gradient(135deg, ${G.green}, rgba(52,211,153,0.7))`
                : 'rgba(30,41,59,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: recipientInfo ? G.navy : G.slateD, fontSize: '1rem',
              flexShrink: 0,
            }}>
              {initials || <FaUser style={{ opacity: 0.4 }} />}
            </div>
            <div>
              <div style={{ color: recipientInfo ? G.white : G.slateD, fontWeight: 600, fontSize: '0.9rem' }}>
                {recipientInfo ? (recipientInfo.displayName || recipientInfo.username) : 'No recipient yet'}
              </div>
              <div style={{ color: G.slateD, fontSize: '0.75rem', marginTop: 2 }}>
                {recipientInfo ? `@${recipientInfo.username}` : 'Enter a Pay ID below'}
              </div>
            </div>
            {recipientInfo && (
              <FaCheckCircle style={{ marginLeft: 'auto', color: G.green, fontSize: '1.1rem', flexShrink: 0 }} />
            )}
          </div>

          {/* Pay ID input */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Pay ID</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  value={recipientPayId}
                  onChange={e => setRecipientPayId(e.target.value.trim())}
                  placeholder="e.g. user123"
                  style={inputStyle(!!errors.recipientPayId)}
                />
                {isVerifying && (
                  <FaSyncAlt style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    color: G.gold, fontSize: '0.85rem', animation: 'spin 1s linear infinite',
                  }} />
                )}
                {!isVerifying && recipientPayId && (
                  recipientInfo
                    ? <FaCheckCircle style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: G.green }} />
                    : <FaTimesCircle style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: G.red }} />
                )}
              </div>
              <button
                onClick={() => verifyPayId(recipientPayId)}
                disabled={!recipientPayId || isVerifying}
                style={{
                  padding: '0 16px', borderRadius: '10px', border: `1px solid ${G.goldBorder}`,
                  background: recipientPayId && !isVerifying ? G.goldFaint : 'transparent',
                  color: G.gold, fontSize: '0.82rem', fontWeight: 700, cursor: recipientPayId ? 'pointer' : 'not-allowed',
                  whiteSpace: 'nowrap',
                }}
              >
                {isVerifying ? 'Checking...' : 'Verify'}
              </button>
            </div>
            {errors.recipientPayId && <div style={{ color: G.red, fontSize: '0.75rem', marginTop: 4 }}>{errors.recipientPayId}</div>}
          </div>

          {/* Note */}
          <div>
            <label style={labelStyle}><FaStickyNote style={{ marginRight: 4 }} />Note (optional)</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. for rent"
              style={inputStyle(false)}
            />
          </div>

          {showAlert && (
            <div style={{ marginTop: '14px' }}>
              <Alert message={alertMessage} type={alertType} onClose={handleCloseAlert} />
            </div>
          )}
        </div>

        {/* 鈹€鈹€ Right: Amount & Submit 鈹€鈹€ */}
        <div style={{ ...card, width: isMobile ? '100%' : '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.4rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: G.navy,
            }}>
              <FaPaperPlane style={{ fontSize: '0.9rem' }} />
            </div>
            <div>
              <div style={{ color: G.white, fontWeight: 700, fontSize: '0.95rem' }}>Send</div>
              <div style={{ color: G.slateD, fontSize: '0.72rem' }}>
                Balance: <span style={{ color: G.gold }}>
                  {balance !== null ? `\u20a6${Number(balance).toLocaleString()}` : '...'}
                </span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label style={labelStyle}>Amount (NGN)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount"
              style={inputStyle(!!errors.amount)}
            />
            {errors.amount && <div style={{ color: G.red, fontSize: '0.75rem', marginTop: 4 }}>{errors.amount}</div>}
          </div>

          {/* PIN */}
          <div>
            <label style={labelStyle}><FaLock style={{ marginRight: 4 }} />Transfer PIN</label>
            <input
              type="password"
              value={transferPin}
              onChange={e => setTransferPin(e.target.value)}
              placeholder="Enter PIN"
              style={inputStyle(!!errors.transferPin)}
            />
            {errors.transferPin && <div style={{ color: G.red, fontSize: '0.75rem', marginTop: 4 }}>{errors.transferPin}</div>}
          </div>

          {/* Summary row */}
          {amountNumber > 0 && recipientInfo && (
            <div style={{
              padding: '10px 12px', borderRadius: '10px',
              background: G.greenFaint, border: `1px solid rgba(52,211,153,0.2)`,
              fontSize: '0.8rem', color: G.slate,
            }}>
              Sending <strong style={{ color: G.green }}>{`\u20a6${amountNumber.toLocaleString()}`}</strong> to <strong style={{ color: G.white }}>{recipientInfo.displayName || recipientInfo.username}</strong>
            </div>
          )}

          {/* CTA */}
          <button
            disabled={!canSubmit}
            onClick={() => setShowConfirm(true)}
            style={{
              width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
              background: canSubmit
                ? `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`
                : 'rgba(100,116,139,0.3)',
              color: canSubmit ? G.navy : G.slateD,
              fontSize: '0.92rem', fontWeight: 800,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: canSubmit ? '0 4px 16px rgba(245,166,35,0.3)' : 'none',
            }}
          >
            {isSubmitting ? 'Sending...' : `Send ${amountNumber > 0 ? `\u20a6${amountNumber.toLocaleString()}` : ''}`}
          </button>
          <p style={{ margin: 0, fontSize: '0.72rem', color: G.slateD, textAlign: 'center' }}>
            You will be asked to confirm before funds are sent.
          </p>
        </div>
      </div>

      {/* 鈹€鈹€ Confirm Modal 鈹€鈹€ */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(4px)',
        }} onClick={() => setShowConfirm(false)}>
          <div style={{
            background: G.navy2, borderRadius: '18px', padding: '1.8rem',
            width: isMobile ? '90%' : 420, maxWidth: '100%',
            border: `1px solid ${G.goldBorder}`,
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: G.white, margin: '0 0 8px', fontWeight: 800 }}>Confirm Transfer</h3>
            <p style={{ color: G.slate, margin: '0 0 16px', fontSize: '0.88rem', lineHeight: 1.6 }}>
              You are sending{' '}
              <strong style={{ color: G.gold }}>{`\u20a6${Number(amount || 0).toLocaleString()}`}</strong>{' '}
              to{' '}
              <strong style={{ color: G.white }}>
                {recipientInfo ? (recipientInfo.displayName || recipientInfo.username) : recipientPayId}
              </strong>.
            </p>
            {note && (
              <p style={{ color: G.slateD, fontSize: '0.82rem', margin: '0 0 16px' }}>Note: {note}</p>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirm(false)} style={{
                padding: '10px 20px', borderRadius: '10px',
                border: `1px solid ${G.goldBorder}`, background: 'transparent',
                color: G.slate, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button
                onClick={async () => { setShowConfirm(false); await handleTransfer(); }}
                disabled={isSubmitting}
                style={{
                  padding: '10px 24px', borderRadius: '10px', border: 'none',
                  background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
                  color: G.navy, fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(245,166,35,0.3)',
                }}
              >
                {isSubmitting ? 'Sending...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferPage;
