import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { getJwtToken } from '../utils/auth';
import Alert from './Alert';

// Card-based modern pattern: left = recipient, right = amount & CTA (stacks on small screens)
const TransferPage = () => {
  const [recipientPayId, setRecipientPayId] = useState('');
  const [amount, setAmount] = useState('');
  const [transferPin, setTransferPin] = useState('');
  const [note, setNote] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [balance, setBalance] = useState(null);
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleAlert = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
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

  // Auto-verify Pay ID when user stops typing (500ms debounce)
  useEffect(() => {
    if (!recipientPayId) {
      setRecipientInfo(null);
      return;
    }

    const t = setTimeout(() => {
      verifyPayId(recipientPayId);
    }, 500);

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
    // confirmation is handled by modal; proceed to submit

    try {
      const response = await axios.post(`${apiUrl}/api/wallet/transfer`, { recipientPayId, amount: Number(amount), transferPin, note }, { headers: { Authorization: `Bearer ${token}` } });
      handleAlert(response.data.message || 'Transfer successful', 'success');
      // reset
      setRecipientPayId(''); setRecipientInfo(null); setAmount(''); setTransferPin(''); setNote('');
      try { const r = await axios.get(`${apiUrl}/api/wallet/data`, { headers: { Authorization: `Bearer ${token}` } }); setBalance(r.data?.balance ?? null); } catch(e){}
    } catch (e) {
      handleAlert(e.response?.data?.message || 'Transfer failed.', 'error');
    } finally { setIsSubmitting(false); }
  }, [recipientPayId, amount, transferPin, note, apiUrl, recipientInfo, balance]);

  const amountNumber = Number(amount || 0);
  const canSubmit = !isSubmitting && recipientInfo && amountNumber > 0 && transferPin && transferPin.length >= 4 && (balance === null || amountNumber <= Number(balance));

  const [showConfirm, setShowConfirm] = useState(false);

  // small helpers for visuals
  const initials = recipientInfo ? (recipientInfo.displayName || recipientInfo.username || '').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase() : '';

  const containerStyle = { display: 'flex', justifyContent: 'center', padding: 20 };
  const cardStyle = { width: '100%', maxWidth: 980, borderRadius: 12, boxShadow: '0 8px 24px rgba(16,24,40,0.08)', background: 'var(--surface, #fff)', padding: 18 };
  const gridStyle = isMobile ? { display: 'block' } : { display: 'flex', gap: 18 };
  const leftStyle = { flex: 1, padding: 16, borderRadius: 10, background: 'linear-gradient(180deg, rgba(249,250,255,0.6), rgba(255,255,255,0.6))' };
  const rightStyle = { width: isMobile ? '100%' : 320, padding: 16, borderRadius: 10, background: '#ffffff', border: '1px solid #eef2ff', display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'space-between' };

  const inputStyle = { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6e6e6' };
  const smallMuted = { fontSize: 13, color: '#6b7280' };
  const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
  const modalStyle = { background: '#fff', padding: 18, borderRadius: 10, width: isMobile ? '90%' : 420, boxShadow: '0 10px 30px rgba(2,6,23,0.2)' };
  const modalBtn = (primary) => ({ padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: primary ? 'var(--app-primary, #162660)' : '#fff', color: primary ? '#fff' : '#162660', boxShadow: primary ? 'none' : 'inset 0 0 0 1px rgba(22,38,96,0.06)' });

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ margin: 0, color: 'var(--app-primary, #162660)' }}>Transfer</h2>
        <div style={{ marginTop: 6, marginBottom: 14, color: '#6b7280' }}>Send funds to another user — verify recipient before sending.</div>

        <div style={gridStyle}>
          <div style={leftStyle}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--app-primary, #162660)' }}>{initials || '👤'}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{recipientInfo ? (recipientInfo.displayName || recipientInfo.username) : 'Recipient'}</div>
                <div style={{ color: '#9ca3af', fontSize: 13 }}>{recipientInfo ? recipientInfo.username : 'Enter Pay ID and verify'}</div>
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>Pay ID</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={recipientPayId} onChange={e => setRecipientPayId(e.target.value.trim())} placeholder="e.g. user123" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => verifyPayId(recipientPayId)} disabled={!recipientPayId || isVerifying} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--app-primary, #162660)', background: '#fff', color: 'var(--app-primary, #162660)', cursor: recipientPayId ? 'pointer' : 'not-allowed' }}>{isVerifying ? 'Verifying...' : 'Verify'}</button>
              </div>
              {!recipientInfo && recipientPayId && !isVerifying && <div style={{ marginTop: 8, color: '#dc2626', fontSize: 13 }}>Pay ID not found</div>}
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>Note (optional)</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. for rent" style={inputStyle} />
            </div>

            {showAlert && <div style={{ marginTop: 12 }}><Alert message={alertMessage} type={alertType} onClose={handleCloseAlert} /></div>}
          </div>

          <div style={rightStyle}>
            <div>
              <div style={{ marginBottom: 8, fontSize: 13, color: '#374151' }}>Amount</div>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (NGN)" style={inputStyle} />
              {errors.amount && <div style={{ color: '#dc2626', marginTop: 6 }}>{errors.amount}</div>}
              <div style={{ marginTop: 8, ...smallMuted }}>Available: ₦{balance !== null ? Number(balance).toLocaleString() : '—'}</div>

              <div style={{ marginTop: 12 }}>
                <div style={{ marginBottom: 6, fontSize: 13 }}>Transfer PIN</div>
                <input type="password" value={transferPin} onChange={e => setTransferPin(e.target.value)} placeholder="PIN" style={inputStyle} />
                {errors.transferPin && <div style={{ color: '#dc2626', marginTop: 6 }}>{errors.transferPin}</div>}
              </div>
            </div>

            <div>
              <button disabled={!canSubmit} onClick={() => setShowConfirm(true)} style={{ width: '100%', padding: 14, borderRadius: 10, background: canSubmit ? 'var(--app-primary, #162660)' : '#9aa4b2', color: '#fff', fontWeight: 700, border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed' }}>{isSubmitting ? 'Sending...' : `Send ₦${Number(amount || 0).toLocaleString() || ''}`}</button>
              <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>You can cancel before confirming the final prompt.</div>
            </div>
          </div>
        </div>
      </div>
      {showConfirm && (
        <div style={overlayStyle} onClick={() => setShowConfirm(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, marginBottom: 8 }}>Confirm transfer</h3>
            <div style={{ color: '#6b7280', marginBottom: 12 }}>You are sending <strong>₦{Number(amount || 0).toLocaleString()}</strong> to <strong>{recipientInfo ? (recipientInfo.displayName || recipientInfo.username) : recipientPayId}</strong>.</div>
            {note && <div style={{ marginBottom: 12, fontSize: 13 }}>Note: {note}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowConfirm(false)} style={modalBtn(false)}>Cancel</button>
              <button type="button" onClick={async () => { setShowConfirm(false); await handleTransfer(); }} style={modalBtn(true)} disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferPage;
