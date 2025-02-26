import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '../components/Alert';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import '../styles/AdminWallet.css';

const AdminWallet = () => {
  const [adminBalance, setAdminBalance] = useState(0);
  const [fundAmount, setFundAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [displayedTransactions, setDisplayedTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showBalance, setShowBalance] = useState(true); // State to control the visibility of the balance
  const [filterType, setFilterType] = useState('all'); // Filter transactions by type
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [fundNote, setFundNote] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222";

  // Fetch Admin Wallet Data
  const fetchWalletData = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/wallet`, { withCredentials: true });
      setAdminBalance(data.balance);
      setTransactions(data.transactions);
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || error.message });
    }
  };

  // Update displayed transactions whenever transactions or showAllTransactions or filterType change
  useEffect(() => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter transactions based on filterType
    const filtered = sortedTransactions.filter(tx => {
      if (filterType === 'all') return true;
      return tx.type.toLowerCase() === filterType;
    });

    setDisplayedTransactions(showAllTransactions ? filtered : filtered.slice(0, 10));
  }, [transactions, showAllTransactions, filterType]);

  useEffect(() => {
    fetchWalletData();
  }, [apiUrl]);

  // Fund Admin Wallet
  const handleFundWallet = async () => {
    if (!fundAmount || fundAmount <= 0) {
      setAlert({ type: 'error', message: 'Please enter a valid amount.' });
      return;
    }

    try {
      const { data } = await axios.post(
        `${apiUrl}/api/wallet/fund`,
        { amount: parseFloat(fundAmount), note: fundNote },  // Include note
        { withCredentials: true }
      );
      setAlert({ type: 'success', message: data.message });
      setFundAmount('');
      setFundNote(''); // Clear the note input after success
      fetchWalletData();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error funding wallet' });
    }
  };


  // Withdraw from Admin Wallet
  const handleWithdrawFunds = async (withdrawAmount) => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      setAlert({ type: 'error', message: 'Please enter a valid amount to withdraw.' });
      return;
    }

    try {
      const { data } = await axios.post(
        `${apiUrl}/api/admin/wallet/withdraw`,
        { amount: parseFloat(withdrawAmount), note: withdrawNote },  // Include note
        { withCredentials: true }
      );
      setAlert({ type: 'success', message: data.message });
      setWithdrawAmount('');
      setWithdrawNote(''); // Clear the note input after success
      fetchWalletData();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error withdrawing funds' });
    }
  };


  // Filter transactions based on search term
  const filteredTransactions = displayedTransactions.filter((tx) =>
    tx._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.amount.toString().includes(searchTerm)
  );

  // Handle "See More" button click to show all transactions
  const handleSeeMore = () => {
    setShowAllTransactions(true);
  };

  // Function to format balance value safely
  const formatBalance = (balance) => {
    return balance && !isNaN(balance) ? balance.toLocaleString() : 'N/A';
  };

  return (
    <div className="admin-wallet-container">
      <h1 className="admin-wallet-header">Admin Wallet</h1>

      {alert && <Alert message={alert.message} type={alert.type} />}

      {/* Balance visibility toggle with eye icon */}
      <button className="toggle-balance-button" onClick={() => setShowBalance(!showBalance)}>
        {showBalance ? <FaEyeSlash /> : <FaEye />}
        {showBalance ? 'Hide Balance' : 'Show Balance'}
      </button>

      {/* Balance display */}
      {showBalance && (
        <div className="admin-card">
          <h2 className="section-header">Admin Wallet Balance</h2>
          <p className="balance">₦{formatBalance(adminBalance)}</p>
        </div>
      )}
      <div className="admin-card">
        <h2 className="section-header">Fund Admin Wallet</h2>
        <div className="input-group">
          <input
            type="number"
            placeholder="Enter amount (₦)"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Enter note (optional)"
            value={fundNote}
            onChange={(e) => setFundNote(e.target.value)}
            className="input-field"
          />
          <button className="fund-button" onClick={handleFundWallet}>
            Fund Wallet
          </button>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="section-header">Withdraw Funds</h2>
        <div className="input-group">
          <input
            type="number"
            placeholder="Enter withdrawal amount (₦)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Enter note (optional)"
            value={withdrawNote}
            onChange={(e) => setWithdrawNote(e.target.value)}
            className="input-field"
          />
          <button className="withdraw-button" onClick={() => handleWithdrawFunds(withdrawAmount)}>
            Withdraw
          </button>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="section-header">Search Transactions</h2>
        <input
          type="text"
          placeholder="Search by ID, Type, or Amount"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      {/* Filter Transactions by Type */}
      <div className="filter-type">
        <label>Filter by Type:</label>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
          <option value="all">All</option>
          <option value="funding">Funding</option>
          <option value="withdrawal">Withdrawal</option>
        </select>
      </div>

      <div className="admin-card">
        <h2 className="section-header">Transaction History</h2>
        {isMobile ? (
        <div className="transaction-cards">
          {filteredTransactions.map((tx) => (
            <div key={tx._id} className="transaction-card">
              <p><strong>ID:</strong> {tx._id}</p>
              <p><strong>Type:</strong> {tx.type}</p>
              <p style={{ color: tx.type === 'Funding' ? 'green' : 'orangered' }}>
                <strong>Amount:</strong> {tx.type === 'Funding' ? `+₦${tx.amount.toLocaleString()}` : `-₦${tx.amount.toLocaleString()}`}
              </p>
              <p><strong>Note:</strong> {tx.note || 'N/A'}</p>
              <p><strong>Date:</strong> {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Note</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx._id}>
                <td>{tx._id}</td>
                <td>{tx.type}</td>
                <td style={{ color: tx.type === 'Funding' ? 'green' : 'orangered' }}>
                  {tx.type === 'Funding' ? `+₦${tx.amount.toLocaleString()}` : `-₦${tx.amount.toLocaleString()}`}
                </td>
                <td>{tx.note || 'N/A'}</td>
                <td>{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

         {/* Show "See More" button if not all transactions are shown */}
         {!showAllTransactions && transactions.length > 10 && (
          <button className="see-more-button" onClick={handleSeeMore}>
            See More
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminWallet;
