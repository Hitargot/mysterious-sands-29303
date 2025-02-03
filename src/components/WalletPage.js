import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';
import '../styles/WalletPage.css';
import { useNotification } from '../context/NotificationContext';
import { v4 as uuidv4 } from 'uuid';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons from react-icons

const WalletPage = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [showAddBankForm, setShowAddBankForm] = useState(false);
  const { addNotification } = useNotification();
  const [newBankAccount, setNewBankAccount] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  //const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  const apiUrl = "http://localhost:22222";

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  }


  const navigate = useNavigate();

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
      if (typeof balance === 'number') {
        setWalletBalance(balance);
      } else {
        handleAlert('Unexpected response format: balance not found.', 'error');
      }
    } catch (error) {
      handleAlert(error.response?.data?.message || 'Failed to load wallet data.', 'error');
    }
  }, [getJwtToken, apiUrl]);

  // Fetch bank accounts
  const fetchBankAccounts = useCallback(async () => {
    const token = getJwtToken();
    if (!token) return;

    try {
        const response = await axios.get(`${apiUrl}/api/wallet/banks`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Bank Accounts Response:', response.data);

        if (Array.isArray(response.data.banks) && response.data.banks.length > 0) {
            setBankAccounts(response.data.banks);
            
            // Set a default selected bank account ID if banks are available
            setSelectedBankAccount(response.data.banks[0]._id);
        } else {
            handleAlert('No bank accounts available. Please add a bank account.', 'error');
            setBankAccounts([]);
            setSelectedBankAccount(null);
        }
    } catch (error) {
        handleAlert(error.response?.data?.message || 'Failed to load bank accounts.', 'error');
    }
}, [getJwtToken, apiUrl]);



useEffect(() => {
  fetchWalletData();
  fetchBankAccounts();
}, [fetchWalletData, fetchBankAccounts]);




// Ensure useNotification and other hooks are at the top


// Handle Withdraw logic
const handleWithdraw = async () => {
  const token = getJwtToken();
  if (!token) return;

  const amount = parseFloat(withdrawAmount);
  console.log("Withdraw Amount:", amount);
  console.log("Selected Bank Account ID:", selectedBankAccount);

  if (!bankAccounts || bankAccounts.length === 0) {
    handleAlert('No bank accounts found. Please add or refresh bank accounts.', 'error');
    addNotification({
      message: 'No bank accounts found. Please add or refresh bank accounts.',
      type: 'error',
      read: false,
    });
    return;
  }

  if (!selectedBankAccount) {
    handleAlert('Please select a bank account.', 'error');
    addNotification({
      message: 'Please select a bank account.',
      type: 'error',
      read: false,
    });
    return;
  }

  const [bankName, accountNumber] = selectedBankAccount.split(' - ');
  const selectedBank = bankAccounts.find(
    bank => bank.bankName === bankName && bank.accountNumber === accountNumber
  );

  console.log("Selected Bank Object:", selectedBank);

  if (!selectedBank) {
    handleAlert('Invalid bank selection. Please select a valid bank account.', 'error');
    addNotification({
      message: 'Invalid bank selection. Please select a valid bank account.',
      type: 'error',
      read: false,
    });
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    handleAlert('Please enter a valid withdrawal amount greater than zero.', 'error');
    addNotification({
      message: 'Please enter a valid withdrawal amount greater than zero.',
      type: 'error',
      read: false,
    });
    return;
  }

  if (amount > walletBalance) {
    handleAlert('Insufficient funds. Enter an amount within your wallet balance.', 'error');
    addNotification({
      message: 'Insufficient funds. Enter an amount within your wallet balance.',
      type: 'error',
      read: false,
    });
    return;
  }

  try {
    console.log('Withdrawal Request Data:', {
      amount,
      bankId: selectedBank.id,
      accountNumber: selectedBank.accountNumber
    });

    const response = await axios.post(
      `${apiUrl}/api/wallet/withdraw`,
      { 
        amount, 
        bankId: selectedBank.id,
        accountNumber: selectedBank.accountNumber 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('Withdrawal Success:', response.data);

    addNotification({
      id: uuidv4(),
      message: 'Withdrawal request submitted successfully!',
      type: 'success',
      read: false
    });

    handleAlert('Withdrawal request submitted successfully!', 'success');

    setWithdrawAmount('');
    fetchWalletData();

  } catch (error) {
    console.error('Error submitting withdrawal request:', error);
    handleAlert(
      error.response?.data?.message || 'Error submitting withdrawal request.',
      'error'
    );

    addNotification({
      message: error.response?.data?.message || 'Error submitting withdrawal request.',
      type: 'error',
      read: false,
    });
  }
};

  // Handle adding a new bank account
  const handleAddBankAccount = async () => {
    const token = getJwtToken();
    if (!token) return;

    const { bankName, accountNumber, accountName } = newBankAccount;
    if (!bankName || !accountNumber || !accountName) {
      handleAlert('Please fill in all fields to add a bank account.', 'error');
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/api/wallet/banks`,
        { bankName, accountNumber, accountName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBankAccounts([...bankAccounts, response.data.bank]);
      setNewBankAccount({ bankName: '', accountNumber: '', accountName: '' });
      setShowAddBankForm(false);
      handleAlert('Bank account added successfully!', 'success');
    } catch (error) {
      handleAlert(error.response?.data?.message || 'Error adding bank account.', 'error');
    }
  };

  // Handle adding balance (for testing)
  const handleAddBalance = async () => {
    const token = getJwtToken();
    if (!token) return;
  
    const amount = 1000; // Static amount of 1000 NGN for testing
  
    try {
      const response = await axios.post(
        `${apiUrl}/api/wallet/add-balance`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      handleAlert('Balance added successfully!');
      setWalletBalance(response.data.newBalance);  // Use the new balance from the response
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding balance.');
    }
  };
  

  // Handle alert
  const handleAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  // Handle alert close
  const handleCloseAlert = () => setShowAlert(false);

  return (
    <div className="wallet-page">
       <div className="balance">
      <h2>Wallet Balance: {isBalanceVisible ? `${walletBalance} NGN` : '*****'}</h2>
      <span onClick={toggleBalanceVisibility} style={{ cursor: 'pointer' }}>
        {isBalanceVisible ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>

      <div className="withdraw-section">
        <h3>Withdraw Funds</h3>
        <label>
          Select Bank Account:
          <select value={selectedBankAccount} onChange={(e) => setSelectedBankAccount(e.target.value)}>
            <option value="">Select a bank account</option>
            {bankAccounts.map((account, index) => (
              <option key={index} value={account._id}>
                {account.bankName} - {account.accountNumber}
              </option>
            ))}
          </select>
        </label>
        <label>
          Withdraw Amount:
          <input
            type="number"
            placeholder="Enter amount to withdraw"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
        </label>
        <button
          onClick={handleWithdraw}
          disabled={!selectedBankAccount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > walletBalance}
        >
          Submit Withdrawal
        </button>
      </div>

      <button onClick={() => setShowAddBankForm(!showAddBankForm)} className="add-bank-button">
        {showAddBankForm ? 'Cancel' : 'Add Bank Account'}
      </button>

      {showAddBankForm && (
        <div className="add-bank-form">
          <h3>Add New Bank Account</h3>
          <label>Bank Name:
            <input
              type="text"
              value={newBankAccount.bankName}
              onChange={(e) => setNewBankAccount({ ...newBankAccount, bankName: e.target.value })}
            />
          </label>
          <label>Account Number:
            <input
              type="text"
              value={newBankAccount.accountNumber}
              onChange={(e) => setNewBankAccount({ ...newBankAccount, accountNumber: e.target.value })}
            />
          </label>
          <label>Account Name:
            <input
              type="text"
              value={newBankAccount.accountName}
              onChange={(e) => setNewBankAccount({ ...newBankAccount, accountName: e.target.value })}
            />
          </label>
          <button onClick={handleAddBankAccount}>Add Account</button>
        </div>
      )}

      {showAlert && <Alert message={alertMessage} type={alertType} onClose={handleCloseAlert} />}
      <button onClick={handleAddBalance}>Add 1000 NGN for testing</button>
    </div>
  );
};

export default WalletPage;
