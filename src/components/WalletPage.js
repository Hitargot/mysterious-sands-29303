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
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222";

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
    <div
      style={{
        backgroundColor: "#d0e6fd",
        padding: "20px",
        borderRadius: "10px",
        maxWidth: "500px",
        margin: "auto",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Wallet Balance Section */}
      <div
        style={{
          backgroundColor: "#162660",
          color: "#d0e6fd",
          padding: "15px",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
        }}
      >
        <h2 style={{ fontSize: "18px", margin: 0 }}>
          Wallet Balance:{" "}
          <span style={{ color: "#f1e4d1" }}>
            {isBalanceVisible ? `${walletBalance.toLocaleString()} NGN` : "*****"}
          </span>
        </h2>
        <span
          onClick={toggleBalanceVisibility}
          style={{ cursor: "pointer", fontSize: "20px" }}
        >
          {isBalanceVisible ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>
  
      {/* Withdraw Funds Section */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "15px",
          borderRadius: "8px",
          marginTop: "15px",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h3 style={{ color: "#162660", marginBottom: "10px" }}>Withdraw Funds</h3>
  
        {/* Bank Account Selection */}
        <label style={{ color: "#162660", fontWeight: "bold", display: "block" }}>
          Select Bank Account:
        </label>
        <select
          value={selectedBankAccount}
          onChange={(e) => setSelectedBankAccount(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            padding: "8px",
            border: "1px solid #162660",
            borderRadius: "5px",
            marginBottom: "10px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <option value="">Select a bank account</option>
          {bankAccounts.map((account, index) => (
            <option key={index} value={account._id}>
              {account.bankName} - {account.accountNumber}
            </option>
          ))}
        </select>
  
        {/* Withdraw Amount Input */}
        <label style={{ color: "#162660", fontWeight: "bold", display: "block" }}>
          Withdraw Amount:
        </label>
        <input
          type="number"
          placeholder="Enter amount"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            padding: "8px",
            border: "1px solid #162660",
            borderRadius: "5px",
            marginTop: "5px",
            marginBottom: "10px",
            backgroundColor: "#f9f9f9",
          }}
        />
  
        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={!selectedBankAccount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > walletBalance}
          style={{
            backgroundColor: "#162660",
            color: "#f1e4d1",
            padding: "10px",
            borderRadius: "5px",
            width: "100%",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#0f1c48")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#162660")}
        >
          Submit Withdrawal
        </button>
      </div>
  
      {/* Add Bank Account Button */}
      <button
        onClick={() => setShowAddBankForm(!showAddBankForm)}
        style={{
          backgroundColor: "#162660",
          color: "#f1e4d1",
          padding: "10px",
          borderRadius: "5px",
          width: "100%",
          marginTop: "10px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {showAddBankForm ? "Cancel" : "Add Bank Account"}
      </button>
  
      {/* Add Bank Account Form */}
      {showAddBankForm && (
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "15px",
            borderRadius: "8px",
            marginTop: "15px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3 style={{ color: "#162660", marginBottom: "10px" }}>Add New Bank Account</h3>
  
          {["Bank Name", "Account Number", "Account Name"].map((field, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <label style={{ color: "#162660", fontWeight: "bold", display: "block" }}>
                {field}:
              </label>
              <input
                type="text"
                value={newBankAccount[field.toLowerCase().replace(" ", "")]}
                onChange={(e) =>
                  setNewBankAccount({ ...newBankAccount, [field.toLowerCase().replace(" ", "")]: e.target.value })
                }
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #162660",
                  borderRadius: "5px",
                  backgroundColor: "#f9f9f9",
                }}
              />
            </div>
          ))}
  
          <button
            onClick={handleAddBankAccount}
            style={{
              backgroundColor: "#162660",
              color: "#f1e4d1",
              padding: "10px",
              borderRadius: "5px",
              width: "100%",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Add Account
          </button>
        </div>
      )}
  
      {/* Alert Component */}
      {showAlert && <Alert message={alertMessage} type={alertType} onClose={handleCloseAlert} />}
  
      {/* Add Balance for Testing */}
      <button
        onClick={handleAddBalance}
        style={{
          backgroundColor: "#162660",
          color: "#f1e4d1",
          padding: "10px",
          borderRadius: "5px",
          width: "100%",
          marginTop: "10px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Add 1000 NGN for testing
      </button>
    </div>
  );
  
};

export default WalletPage;
