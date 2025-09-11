import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Alert from './Alert'; // replace with your actual alert component

const apiUrl = process.env.REACT_APP_API_URL;


const BankManager = () => {
  const [bankList, setBankList] = useState([]);       // All banks
  const [searchText, setSearchText] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolveError, setResolveError] = useState('');
  const [resolving, setResolving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '', show: false });

  // Show alert
  const showAlert = ({ message, type }) => {
    setAlert({ message, type, show: true });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 3000);
  };

  // Fetch JWT token
  const getToken = () =>
    localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

  // Fetch all banks
  const fetchBankList = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${apiUrl}/api/banks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedBanks = res.data.sort((a, b) => a.name.localeCompare(b.name));
      setBankList(sortedBanks);
    } catch (err) {
      console.error('Failed to fetch banks:', err);
      showAlert({ message: 'Error fetching banks', type: 'error' });
    }
  }, []);

  // Fetch user's saved bank accounts (optional, can be removed if not used)
  const fetchUserBanks = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      await axios.get(`${apiUrl}/api/wallet/banks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // You can store user banks if needed
    } catch (err) {
      console.error('Failed to fetch user banks:', err);
    }
  }, []);

  useEffect(() => {
    fetchBankList();
    fetchUserBanks();
  }, [fetchBankList, fetchUserBanks]);

  // Resolve account when bankCode and accountNumber are set
  const resolveAccount = useCallback(async () => {
    if (!bankCode || accountNumber.length !== 10) return;

    setResolving(true);
    setAccountName('');
    setResolveError('');

    const selectedBank = bankList.find(bank => bank.code === bankCode);
    const bankNameForCache = selectedBank ? selectedBank.name : '';
    const cacheKey = `${bankNameForCache}-${accountNumber}`;

    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setAccountName(cached);
      setResolving(false);
      return;
    }

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
        setResolveError('Account not found ❌');
      }
    } catch (err) {
      console.error('Resolve Account Error:', err);
      setResolveError('Account not found ❌');
    } finally {
      setResolving(false);
    }
  }, [bankCode, accountNumber, bankList]);

  useEffect(() => {
    if (bankCode && accountNumber.length === 10) {
      resolveAccount();
    } else {
      setAccountName('');
      setResolveError('');
      setResolving(false);
    }
  }, [bankCode, accountNumber, resolveAccount]);

  // Submit new bank account
  const handleSubmit = async () => {
    if (!bankCode || !accountNumber || !accountName) {
      showAlert({ message: 'Please fill all fields', type: 'error' });
      return;
    }

    const selectedBank = bankList.find(bank => bank.code === bankCode);
    const bankNameToSubmit = selectedBank ? selectedBank.name : '';

    setSubmitting(true);
    try {
      const token = getToken();

      await axios.post(
        `${apiUrl}/api/wallet/banks`,
        { bankCode, bankName: bankNameToSubmit, accountNumber, accountName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert({ message: 'Bank added successfully!', type: 'success' });

      setBankCode('');
      setAccountNumber('');
      setAccountName('');
      fetchUserBanks();
    } catch (err) {
      console.error('Add Bank Error:', err);
      if (err.response && err.response.status === 400) {
        showAlert({ message: 'This bank account is already added', type: 'error' });
      } else {
        showAlert({ message: 'Failed to add bank', type: 'error' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBanks = bankList.filter(bank =>
    bank.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px' }}>
      <h2>Manage Bank Accounts</h2>

      {alert.show && <Alert message={alert.message} type={alert.type} />}

      <label>Search Banks</label>
      <input
        type="text"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        placeholder="Search banks..."
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      />

      <label>Select Bank</label>
      <select
        value={bankCode}
        onChange={e => setBankCode(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      >
        <option value="">Select Bank</option>
        {filteredBanks.map(bank => (
          <option key={bank.code} value={bank.code}>
            {bank.name}
          </option>
        ))}
      </select>

      <label>Account Number</label>
      <input
        type="text"
        value={accountNumber}
        onChange={e => setAccountNumber(e.target.value)}
        placeholder="10-digit account number"
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      />

      {resolving && <small style={{ color: 'blue' }}>Resolving account...</small>}
      {accountName && <small style={{ color: 'green' }}>Account Name: {accountName}</small>}
      {resolveError && <small style={{ color: 'red' }}>{resolveError}</small>}

      <button
        onClick={handleSubmit}
        disabled={submitting || resolving}
        style={{
          marginTop: '10px',
          width: '100%',
          padding: '10px',
          backgroundColor: '#162660',
          color: '#f1e4d1',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        {submitting ? 'Submitting...' : 'Add Bank Account'}
      </button>
    </div>
  );
};

export default BankManager;
