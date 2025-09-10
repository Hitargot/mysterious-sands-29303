import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { getJwtToken } from '../utils/auth';
import Alert from './Alert';

const TransferPage = () => {
  const [recipientPayId, setRecipientPayId] = useState('');
  const [amount, setAmount] = useState('');
  const [transferPin, setTransferPin] = useState('');
  const [note, setNote] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false); // New state
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasTyped, setHasTyped] = useState(false); // Track if user typed

  const apiUrl = 'http://localhost:22222';

  const handleAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const handleCloseAlert = () => setShowAlert(false);

  // 🔹 Verify Pay ID with debounce
  const verifyPayId = useCallback(async (payId) => {
    if (!payId) {
      setRecipientInfo(null);
      return;
    }

    setIsVerifying(true);
    const token = getJwtToken();
    if (!token) return;

    try {
      const res = await axios.get(`${apiUrl}/api/users/verify/${payId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = res.data?.user || null;

      if (user) {
        console.log('Verified user:', user); // debug
        setRecipientInfo({
          ...user,
          displayName: user.displayName || user.username, // fallback
        });
      } else {
        setRecipientInfo(null);
      }
    } catch (err) {
      console.error('Error verifying Pay ID:', err);
      setRecipientInfo(null);
    } finally {
      setIsVerifying(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!recipientPayId) {
      setRecipientInfo(null);
      setHasTyped(false);
      return;
    }

    setHasTyped(true);

    const timer = setTimeout(() => {
      verifyPayId(recipientPayId);
    }, 500); // 0.5s debounce

    return () => clearTimeout(timer);
  }, [recipientPayId, verifyPayId]);

  const handleTransfer = useCallback(async () => {
    const token = getJwtToken();
    if (!token) {
      handleAlert('You must be logged in to make a transfer.', 'error');
      return;
    }

    if (!recipientPayId || !amount || !transferPin) {
      handleAlert('All fields are required.', 'error');
      return;
    }

    if (!recipientInfo) {
      handleAlert('Recipient Pay ID is invalid.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${apiUrl}/api/wallet/transfer`,
        { recipientPayId, amount: Number(amount), transferPin, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      handleAlert(response.data.message, 'success');

      // Reset form
      setRecipientPayId('');
      setRecipientInfo(null);
      setAmount('');
      setTransferPin('');
      setNote('');
    } catch (error) {
      console.error(error);
      handleAlert(error.response?.data?.message || 'Transfer failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [recipientPayId, amount, transferPin, note, apiUrl, recipientInfo]);


  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '25px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ marginBottom: '15px', color: '#162660' }}>Transfer Funds</h2>

        {/* Info Note */}
        <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px' }}>
          This is a <strong>user-to-user transfer</strong>. Please ensure the recipient Pay ID is correct.
        </p>

        <label>Recipient Pay ID</label>
        <input
          type="text"
          value={recipientPayId}
          onChange={(e) => setRecipientPayId(e.target.value)}
          placeholder="Recipient Pay ID"
          style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          disabled={isSubmitting}
          autoComplete="off"
        />
        {isVerifying && <small style={{ color: 'blue' }}>Verifying...</small>}

        {recipientInfo && (
          <small style={{ color: 'green' }}>Recipient: {recipientInfo.displayName}</small>
        )}

        {!recipientInfo && recipientPayId && !isVerifying && hasTyped && (
          <small style={{ color: 'red' }}>Pay ID not found</small>
        )}

        <label>Amount (NGN)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          disabled={isSubmitting}
        />

        <label>Transfer PIN</label>
        <input
          type="password"
          value={transferPin}
          onChange={(e) => setTransferPin(e.target.value)}
          placeholder="PIN"
          style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          disabled={isSubmitting}
          autoComplete="new-password"
        />

        <label>Note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note"
          style={{ display: 'block', width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          disabled={isSubmitting}
        />

        <button
          onClick={handleTransfer}
          style={{
            backgroundColor: isSubmitting ? '#6c757d' : '#162660',
            color: '#f1e4d1',
            padding: '12px',
            borderRadius: '5px',
            width: '100%',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            border: 'none',
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Transfer'}
        </button>

        {showAlert && <Alert message={alertMessage} type={alertType} onClose={handleCloseAlert} />}
      </div>
    </div>
  );
};

export default TransferPage;
