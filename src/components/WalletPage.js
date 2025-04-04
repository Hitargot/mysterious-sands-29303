import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';
import '../styles/WalletPage.css';
import { useNotification } from '../context/NotificationContext';
import { v4 as uuidv4 } from 'uuid';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons from react-icons
import WithdrawalPinInput from './WithdrawalPinInput'; // Import the PIN input component


const WalletPage = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showPinInput, setShowPinInput] = useState(false); // State to control the PIN input visibility
  const [alertType, setAlertType] = useState('success');
  const [showAddBankForm, setShowAddBankForm] = useState(false);
  const { addNotification } = useNotification();
  const [newBankAccount, setNewBankAccount] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Allow only numbers for accountNumber
    if (name === "accountNumber" && !/^\d*$/.test(value)) return;

    setNewBankAccount((prev) => ({ ...prev, [name]: value }));
  };

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
  }, [fetchWalletData, fetchBankAccounts]); // Ensure the effect runs on these dependencies
  
  // Handle withdrawal logic
  const handleWithdraw = async () => {
    const token = getJwtToken();
    if (!token) return;
  
    // Step 1: Check if user has set a withdrawal PIN
    const pinCheckResponse = await axios.get(`${apiUrl}/api/wallet/check-pin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (pinCheckResponse.data.hasPin === false) {
      window.location.href = '/set-pin'; // Redirect if no PIN is set
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
  
    const [bankName, accountNumber] = selectedBankAccount.split(' - ');
    const selectedBank = bankAccounts.find(
      (bank) => bank.bankName === bankName && bank.accountNumber === accountNumber
    );
  
    if (!selectedBank) {
      handleAlert('Invalid bank selection. Please select a valid bank account.', 'error');
      return;
    }
  
    if (isNaN(amount) || amount <= 0) {
      handleAlert('Please enter a valid withdrawal amount greater than zero.', 'error');
      return;
    }
  
    if (amount > Number(walletBalance || 0)) {
      handleAlert('Insufficient funds. Enter an amount within your wallet balance.', 'error');
      return;
    }
  
    // Step 2: Show PIN input
    setShowPinInput(true); // Show PIN input form when user proceeds
  };
  
  // Handle the PIN submit logic
  const handlePinSubmit = async (withdrawPin) => {
    const token = getJwtToken();
    if (!token) {
      console.error('No token found.');
      return;
    }
  
    // Validate bank account selection
    if (!selectedBankAccount) {
      handleAlert('Please select a bank account.', 'error');
      return;
    }
  
    const [bankName, accountNumber] = selectedBankAccount.split(' - ');
    const selectedBank = bankAccounts.find(
      (bank) => bank.bankName === bankName && bank.accountNumber === accountNumber
    );
  
    if (!selectedBank) {
      handleAlert('Invalid bank account selected', 'error');
      return;
    }
  
    // Parse withdraw amount
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      handleAlert('Invalid withdrawal amount. Please enter a valid amount.', 'error');
      return;
    }
  
    try {
      const response = await axios.post(
        `${apiUrl}/api/wallet/withdraw`,
        { 
          amount, 
          bankId: selectedBank.id, 
          accountNumber: selectedBank.accountNumber, 
          withdrawPin 
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          } 
        }
      );
      setWithdrawAmount('');
      setSelectedBankAccount('');
      setShowPinInput(false);

      if (response.data.success) {
        console.log('Withdrawal Success:', response.data);
  
        // Clear fields and hide the PIN input form immediately after success
       
  
        // Show success alert
        handleAlert('Withdrawal request submitted successfully!', 'success');
  
        // Refresh wallet data
        fetchWalletData();
  
        // Success notifications
        addNotification({
          id: uuidv4(),
          message: 'Withdrawal request submitted successfully!',
          type: 'success',
          read: false,
        });
  
        // Reload the page to reflect updates
        setTimeout(() => {
          window.location.reload();
        }, 1500);
  
      } else {
        handleAlert(response.data.message || 'Withdrawal failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      handleAlert(error.response?.data?.message || 'Error submitting withdrawal request.', 'error');
    }
  };
  
  // Log important states for debugging purposes
  useEffect(() => {
    console.log('Withdraw Amount:', withdrawAmount);
    console.log('Selected Bank Account:', selectedBankAccount);
    console.log('Show PIN Input:', showPinInput);
  }, [withdrawAmount, selectedBankAccount, showPinInput]);
  

  const fetchUserBanks = async () => {
    const token = getJwtToken();
    if (!token) return;
  
    try {
      const response = await axios.get(`${apiUrl}/api/wallet/banks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setBankAccounts(response.data.banks);
    } catch (error) {
      console.error("Error fetching banks:", error);
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
  
      // ✅ Update state correctly
      setBankAccounts((prevBanks) => [...prevBanks, response.data.bank]);
  
      // ✅ Ensure the withdrawal form updates with the latest banks
      fetchUserBanks();
  
      setNewBankAccount({ bankName: '', accountNumber: '', accountName: '' });
      setShowAddBankForm(false);
      handleAlert('Bank account added successfully!', 'success');
    } catch (error) {
      handleAlert(error.response?.data?.message || 'Error adding bank account.', 'error');
    }
  };
  
  // Handle adding balance (for testing)
  // const handleAddBalance = async () => {
  //   const token = getJwtToken();
  //   if (!token) return;

  //   const amount = 1000; // Static amount of 1000 NGN for testing

  //   try {
  //     const response = await axios.post(
  //       `${apiUrl}/api/wallet/add-balance`,
  //       { amount },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     handleAlert('Balance added successfully!');
  //     setWalletBalance(response.data.newBalance);  // Use the new balance from the response
  //   } catch (error) {
  //     alert(error.response?.data?.message || 'Error adding balance.');
  //   }
  // };


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
              {/* Conditionally render the PIN input if showPinInput is true */}
      {showPinInput && <WithdrawalPinInput onPinSubmit={handlePinSubmit} />}
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

          <div style={{ marginBottom: "10px" }}>
            <label style={{ color: "#162660", fontWeight: "bold", display: "block" }}>Bank Name:</label>
            <input
              type="text"
              name="bankName"
              value={newBankAccount.bankName}
              onChange={handleInputChange}
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

          <div style={{ marginBottom: "10px" }}>
            <label style={{ color: "#162660", fontWeight: "bold", display: "block" }}>Account Number:</label>
            <input
              type="number"
              name="accountNumber"
              value={newBankAccount.accountNumber}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "+" || e.key === "-") {
                  e.preventDefault(); // Prevents entering "e", "+", and "-" in the field
                }
              }}
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

          <div style={{ marginBottom: "10px" }}>
            <label style={{ color: "#162660", fontWeight: "bold", display: "block" }}>Account Name:</label>
            <input
              type="text"
              name="accountName"
              value={newBankAccount.accountName}
              onChange={handleInputChange}
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
      {/* <button
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
      </button> */}
    </div>
  );

};

export default WalletPage;
