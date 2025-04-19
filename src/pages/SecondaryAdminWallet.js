import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '../components/Alert';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/AdminWallet.css';

const SecondaryAdminWallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [displayedTransactions, setDisplayedTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

//   const apiUrl = "http://localhost:22222";
    const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setAlert({ type: "error", message: "Admin not authenticated" });
        return;
      }

      const { data } = await axios.get(`${apiUrl}/api/secondary-wallet`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setBalance(data.balance);
      setTransactions(data.transactions);
    } catch (error) {
      setAlert({ type: "error", message: error.response?.data?.message || error.message });
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [apiUrl]);

  useEffect(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const filtered = filterType === 'all' ? sorted : sorted.filter(tx => tx.type.toLowerCase() === filterType);
    setDisplayedTransactions(showAllTransactions ? filtered : filtered.slice(0, 10));
  }, [transactions, showAllTransactions, filterType]);

  const filteredTransactions = displayedTransactions.filter((tx) =>
    tx._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.amount.toString().includes(searchTerm)
  );

  const formatBalance = (balance) => {
    return balance && !isNaN(balance) ? balance.toLocaleString() : 'N/A';
  };

  return (
    <div className="admin-wallet-container">
      <h1 className="admin-wallet-header">Withdrawal Admin Wallet</h1>

      {alert && <Alert message={alert.message} type={alert.type} />}

      <button className="toggle-balance-button" onClick={() => setShowBalance(!showBalance)}>
        {showBalance ? <FaEyeSlash /> : <FaEye />}
        {showBalance ? 'Hide Balance' : 'Show Balance'}
      </button>

      {showBalance && (
        <div className="admin-card">
          <h2 className="section-header">Wallet Balance</h2>
          <p className="balance">₦{formatBalance(balance)}</p>
        </div>
      )}

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
                <p><strong>Date:</strong> {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Not available'}</p>
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
      </div>

      {!showAllTransactions && transactions.length > 10 && (
        <button onClick={() => setShowAllTransactions(true)} className="see-more-btn">
          See More Transactions
        </button>
      )}
    </div>
  );
};

export default SecondaryAdminWallet;
