import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';
import '../styles/WalletPage.css';
import { useNotification } from '../context/NotificationContext';
import { v4 as uuidv4 } from 'uuid';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import WithdrawalPinInput from './WithdrawalPinInput';
import BankManager from './BankManager';
import Spinner from './Spinner';
import Modal from './Modal';
import ErrorBoundary from './ErrorBoundary';

const WalletPage = ({ setActiveComponent }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [withdrawFee, setWithdrawFee] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const { addNotification } = useNotification();
  const [showBankManager, setShowBankManager] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  // New UI states
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState(null);
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const toggleBalanceVisibility = () => setIsBalanceVisible(v => !v);

  // Retrieve JWT token
  const getJwtToken = useCallback(() => {
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    if (!token) {
      handleAlert('You must be logged in to view your wallet.', 'error');
      navigate('/login');
      return null;
    }
    return token;
  }, [navigate]);

  // Fetch wallet data (balance)
  const fetchWalletData = useCallback(async () => {
    const token = getJwtToken();
    if (!token) return;
    try {
      const response = await axios.get(`${apiUrl}/api/wallet/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const balance = response.data.balance;
      const fee = response.data.withdrawFee ?? 0;
      if (typeof balance === 'number') {
        setWalletBalance(balance);
        setWithdrawFee(fee);
      } else {
        handleAlert('Unexpected response format: balance not found.', 'error');
      }
    } catch (error) {
      handleAlert(error.response?.data?.message || 'Failed to load wallet data.', 'error');
    }
  }, [getJwtToken, apiUrl]);

  // Fetch bank accounts with loading/error UI
  const fetchBankAccounts = useCallback(async () => {
    const token = getJwtToken();
    if (!token) return;

    setBankLoading(true);
    setBankError(null);
    try {
      const url = `${apiUrl}/api/wallet/banks`;
      console.log('[WalletPage] fetching banks from', url, 'token present=', !!token);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      console.log('[WalletPage] Bank Accounts Response:', response.status, response.data);

      if (Array.isArray(response.data.banks) && response.data.banks.length > 0) {
        setBankAccounts(response.data.banks);
        setSelectedBankAccount(response.data.banks[0]._id);
      } else {
        setBankAccounts([]);
        setSelectedBankAccount(null);
        handleAlert('No bank accounts available. Please add a bank account.', 'error');
      }
    } catch (error) {
      console.error('[WalletPage] failed to fetch banks', error && (error.response || error.message || error));
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message || error.message || 'Failed to load bank accounts.';
      const friendly = serverMsg + (status ? ` (status ${status})` : '');
      setBankError(friendly);
      handleAlert(friendly, 'error');
    } finally {
      setBankLoading(false);
    }
  }, [getJwtToken, apiUrl]);

  useEffect(() => {
    fetchWalletData();
    fetchBankAccounts();
  }, [fetchWalletData, fetchBankAccounts]);

  // Handle withdrawal initial click
  const handleWithdraw = async () => {
    const token = getJwtToken();
    if (!token) return;

    // Check PIN existence
      try {
      const pinCheckResponse = await axios.get(`${apiUrl}/api/wallet/check-pin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pinCheckResponse.data.hasPin === false) {
        // use react-router navigation to preserve SPA state
        navigate('/set-pin');
        return;
      }
    } catch (err) {
      handleAlert('Failed to verify PIN setup.', 'error');
      return;
    }

    const amount = parseFloat(withdrawAmount);

    if (!bankAccounts || bankAccounts.length === 0) {
      handleAlert('No bank accounts found. Please add or refresh bank accounts.', 'error');
      return;
    }

    if (!selectedBankAccount) {
      handleAlert('Please select a bank account.', 'error');
      return;
    }

    const selectedBank = bankAccounts.find((bank) => String(bank._id) === String(selectedBankAccount));
    if (!selectedBank) {
      handleAlert('Invalid bank selection. Please select a valid bank account.', 'error');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      handleAlert('Please enter a valid withdrawal amount greater than zero.', 'error');
      return;
    }

    const totalDebit = Number(amount) + Number(withdrawFee || 0);
    if (totalDebit > Number(walletBalance || 0)) {
      handleAlert(`Insufficient funds. Withdrawal + fee (₦${withdrawFee}) exceeds your balance.`, 'error');
      return;
    }

    setShowPinInput(true);
  };

  // Handle the PIN submit logic
  const handlePinSubmit = async (withdrawPin) => {
    const token = getJwtToken();
    if (!token) {
      console.error('No token found.');
      return false;
    }

    if (!selectedBankAccount) {
      handleAlert('Please select a bank account.', 'error');
      return false;
    }

    const selectedBank = bankAccounts.find((bank) => String(bank._id) === String(selectedBankAccount));
    if (!selectedBank) {
      handleAlert('Invalid bank account selected', 'error');
      return false;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      handleAlert('Invalid withdrawal amount. Please enter a valid amount.', 'error');
      return false;
    }

    setIsSubmittingWithdrawal(true);
    // show immediate feedback
    handleAlert('Submitting withdrawal — please wait...', 'success');

    try {
      const response = await axios.post(
        `${apiUrl}/api/wallet/withdraw`,
        {
          amount,
          bankId: selectedBank._id,
          accountNumber: selectedBank.accountNumber,
          withdrawPin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        }
      );

      // clear inputs and UI
      setWithdrawAmount('');
      setSelectedBankAccount('');
      setShowPinInput(false);

      if (response.data && (response.data.success || response.data.transactionId)) {
        console.log('Withdrawal Success:', response.data);
        handleAlert('Withdrawal request submitted successfully!', 'success');
  // refresh wallet data and show notification instead of forcing a full page reload
  fetchWalletData();
  addNotification({ id: uuidv4(), message: 'Withdrawal request submitted successfully!', type: 'success', read: false });
  // removed window.location.reload() to avoid full page refresh. UI state is updated via fetchWalletData above.
        return true;
      }

      handleAlert(response.data?.message || 'Withdrawal failed. Please try again.', 'error');
      return false;
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      const serverMsg = error.response?.data?.message || error.message || 'Error submitting withdrawal request.';
      handleAlert(serverMsg, 'error');
      return false;
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  // Alert handlers
  const handleAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type || 'error');
    setShowAlert(true);
  };
  const handleCloseAlert = () => setShowAlert(false);

  return (
    <div className="wallet-compact">
      <div className="balance" style={{ backgroundColor: '#162660', color: '#d0e6fd', padding: 12 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>
          Wallet Balance:{' '}
          <span style={{ color: '#f1e4d1' }}>{isBalanceVisible ? `${walletBalance.toLocaleString()} NGN` : '*****'}</span>
        </h2>
        <span onClick={toggleBalanceVisibility} style={{ cursor: 'pointer', fontSize: 20 }}>{isBalanceVisible ? <FaEyeSlash /> : <FaEye />}</span>
      </div>

      <div className="withdraw-section" style={{ marginTop: 12 }}>
        <h3 style={{ color: '#162660', marginBottom: 8 }}>Withdraw Funds</h3>

        <label style={{ color: '#162660', fontWeight: 'bold', display: 'block' }}>Select Bank Account:</label>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={selectedBankAccount}
            onChange={(e) => setSelectedBankAccount(e.target.value)}
            disabled={bankLoading}
            style={{ flex: 1 }}
          >
            <option value="">{bankLoading ? 'Loading banks...' : 'Select a bank account'}</option>
            {bankAccounts.map((account) => (
              <option key={account._id} value={account._id}>{account.bankName} - {account.accountNumber}</option>
            ))}
          </select>

          {bankLoading && <div className="bank-loading"><Spinner size={14} /> Loading…</div>}
          {!bankLoading && bankError && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="bank-error">{bankError}</div>
              <button className="retry-btn" onClick={fetchBankAccounts}>Retry</button>
            </div>
          )}
        </div>

        <label style={{ color: '#162660', fontWeight: 'bold', display: 'block', marginTop: 12 }}>Withdraw Amount:</label>
        <input type="number" placeholder="500 - 1,000,000 NGN" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />

        <div style={{ marginBottom: 10, color: '#374151', marginTop: 8 }}>
          <div style={{ fontSize: 13 }}>Fee: <strong>₦{withdrawFee?.toLocaleString() ?? '0'}</strong></div>
          <div style={{ fontSize: 13 }}>Total debit: <strong>₦{(Number(withdrawAmount || 0) + Number(withdrawFee || 0)).toLocaleString()}</strong></div>
        </div>

        <button className="btn-primary" onClick={handleWithdraw} disabled={bankLoading || isSubmittingWithdrawal || !selectedBankAccount || Number(withdrawAmount) <= 0 || (Number(withdrawAmount) + Number(withdrawFee || 0)) > walletBalance}>{isSubmittingWithdrawal ? 'Submitting…' : 'Submit Withdrawal'}</button>

        {showPinInput && (
          <ErrorBoundary>
            <Modal show={showPinInput} title="Enter withdrawal PIN" onClose={() => setShowPinInput(false)}>
              <WithdrawalPinInput onPinSubmit={handlePinSubmit} onCancel={() => setShowPinInput(false)} />
            </Modal>
          </ErrorBoundary>
        )}
      </div>

      <button className="btn-success" onClick={() => setActiveComponent('transfer')} style={{ width: '100%', marginTop: 12 }}>Send Money to Exdollarium user</button>

      <div style={{ padding: 12 }}>
        <button className="btn-primary" onClick={() => setShowBankManager(!showBankManager)} style={{ width: '100%' }}>{showBankManager ? 'Close Bank Manager' : 'Add Bank Account'}</button>
        {showBankManager && (<div style={{ marginTop: 12 }}><BankManager onAdded={() => fetchBankAccounts()} /></div>)}
      </div>

      {showAlert && <Alert message={alertMessage} type={alertType} onClose={handleCloseAlert} />}
    </div>
  );
};

export default WalletPage;
