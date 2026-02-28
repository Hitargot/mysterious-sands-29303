import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Alert from './Alert';
import { FaUniversity, FaSearch, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const G = {
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.18)', navy: '#0A0F1E', navy2: '#0F172A',
  navy3: '#111827', navy4: '#1E293B', slate: '#94A3B8', slateD: '#64748B',
  white: '#F1F5F9', green: '#34D399', red: '#F87171',
  greenFaint: 'rgba(52,211,153,0.12)', redFaint: 'rgba(248,113,113,0.12)',
};

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(10,15,30,0.7)',
  border: `1px solid ${G.goldBorder}`,
  borderRadius: 10, padding: '10px 14px',
  color: G.white, fontSize: '0.9rem', outline: 'none',
};

const labelStyle = {
  display: 'block', marginBottom: 6,
  fontSize: '0.74rem', fontWeight: 700,
  color: G.slateD, textTransform: 'uppercase', letterSpacing: '0.07em',
};

const apiUrl = process.env.REACT_APP_API_URL;

const BankManager = ({ onAdded }) => {
  const [bankList, setBankList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolveError, setResolveError] = useState('');
  const [resolving, setResolving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '', show: false });

  const showAlert = ({ message, type }) => {
    setAlert({ message, type, show: true });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 3500);
  };

  const getToken = () =>
    localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

  const fetchBankList = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.get(`${apiUrl}/api/banks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBankList(res.data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      showAlert({ message: 'Error fetching bank list', type: 'error' });
    }
  }, []);

  useEffect(() => { fetchBankList(); }, [fetchBankList]);

  const resolveAccount = useCallback(async () => {
    if (!bankCode || accountNumber.length !== 10) return;
    setResolving(true);
    setAccountName('');
    setResolveError('');
    const selectedBank = bankList.find(b => b.code === bankCode);
    const cacheKey = `${selectedBank?.name}-${accountNumber}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) { setAccountName(cached); setResolving(false); return; }
    try {
      const token = getToken();
      const res = await axios.post(
        `${apiUrl}/api/wallet/resolve`,
        { bankCode, accountNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.accountName) {
        setAccountName(res.data.accountName);
        localStorage.setItem(cacheKey, res.data.accountName);
      } else {
        setResolveError('Account not found');
      }
    } catch {
      setResolveError('Account not found');
    } finally {
      setResolving(false);
    }
  }, [bankCode, accountNumber, bankList]);

  useEffect(() => {
    if (bankCode && accountNumber.length === 10) resolveAccount();
    else { setAccountName(''); setResolveError(''); setResolving(false); }
  }, [bankCode, accountNumber, resolveAccount]);

  const handleSubmit = async () => {
    if (!bankCode || !accountNumber || !accountName) {
      showAlert({ message: 'Please fill all fields and wait for account resolution', type: 'error' });
      return;
    }
    const selectedBank = bankList.find(b => b.code === bankCode);
    setSubmitting(true);
    try {
      const token = getToken();
      await axios.post(
        `${apiUrl}/api/wallet/banks`,
        { bankCode, bankName: selectedBank?.name || '', accountNumber, accountName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert({ message: 'Bank account added successfully!', type: 'success' });
      setBankCode(''); setAccountNumber(''); setAccountName(''); setSearchText('');
      if (onAdded) setTimeout(onAdded, 1200);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.response?.data?.error || '';
      if (status === 409 || status === 400 || String(msg).toLowerCase().includes('already')) {
        showAlert({ message: 'This account is already added', type: 'error' });
      } else {
        showAlert({ message: msg || 'Failed to add bank account', type: 'error' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBanks = bankList.filter(b =>
    b.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const canSubmit = bankCode && accountNumber.length === 10 && accountName && !resolving && !submitting;

  return (
    <div>
      {alert.show && <Alert message={alert.message} type={alert.type} />}

      {/* Bank search + select */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}><FaSearch style={{ marginRight: 4 }} /> Search Banks</label>
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: G.slateD, fontSize: '0.78rem' }} />
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Type to filter banks..."
            style={{ ...inputStyle, paddingLeft: 34 }}
          />
        </div>
        <label style={labelStyle}><FaUniversity style={{ marginRight: 4 }} /> Select Bank</label>
        <select
          value={bankCode}
          onChange={e => setBankCode(e.target.value)}
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">{bankList.length === 0 ? 'Loading banks...' : 'Choose a bank'}</option>
          {filteredBanks.map(bank => (
            <option key={bank.code} value={bank.code}>{bank.name}</option>
          ))}
        </select>
      </div>

      {/* Account number */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Account Number</label>
        <input
          type="text"
          value={accountNumber}
          onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="10-digit account number"
          style={inputStyle}
          maxLength={10}
        />
      </div>

      {/* Resolution status */}
      {(resolving || accountName || resolveError) && (
        <div style={{
          marginBottom: 16, padding: '10px 14px', borderRadius: 10,
          background: resolveError ? G.redFaint : G.greenFaint,
          border: `1px solid ${resolveError ? G.red : G.green}`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {resolving && <FaSpinner style={{ color: G.gold, animation: 'spin 0.8s linear infinite' }} />}
          {resolving && <span style={{ color: G.gold, fontSize: '0.84rem' }}>Resolving account name...</span>}
          {!resolving && accountName && <><FaCheckCircle style={{ color: G.green }} /><span style={{ color: G.green, fontSize: '0.88rem', fontWeight: 600 }}>{accountName}</span></>}
          {!resolving && resolveError && <><FaTimesCircle style={{ color: G.red }} /><span style={{ color: G.red, fontSize: '0.84rem' }}>{resolveError}</span></>}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          width: '100%', padding: '13px', borderRadius: 12, border: 'none',
          background: canSubmit
            ? `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`
            : 'rgba(100,116,139,0.25)',
          color: canSubmit ? G.navy : G.slateD,
          fontSize: '0.92rem', fontWeight: 800,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          boxShadow: canSubmit ? '0 4px 16px rgba(245,166,35,0.3)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        {submitting ? 'Adding...' : 'Add Bank Account'}
      </button>
    </div>
  );
};

export default BankManager;
