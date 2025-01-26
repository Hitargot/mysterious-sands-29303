import React, { useState, useEffect } from 'react';
import '../styles/Overview.css';
import { FaArrowRight, FaDollarSign, FaMoneyCheckAlt } from 'react-icons/fa';

const Overview = ({ setActiveComponent }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isBalanceVisible, setBalanceVisible] = useState(false);
  const isMobile = window.innerWidth <= 768;

  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  // const apiUrl = "http://localhost:22222";


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
        const balanceResponse = await fetch(`${apiUrl}/api/wallet/data`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const balanceData = await balanceResponse.json();
        setWalletBalance(balanceData.balance);

        const transactionsResponse = await fetch(`${apiUrl}/api/transaction/transaction-history`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const transactionsData = await transactionsResponse.json();
        setRecentTransactions(transactionsData.transactions.slice(0, 3)); 
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      }
    };

    fetchData();
  }, [apiUrl]);

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!isBalanceVisible);
  };

  return (
    <div className="overview">
      {/* Wallet Balance Card */}
      <div className="card balance-card">
        <h3>Wallet Balance</h3>
        <p className="balance-amount">
          {isBalanceVisible
            ? `₦${walletBalance ? walletBalance.toLocaleString() : '0'}`
            : '****'}
        </p>
        <span onClick={toggleBalanceVisibility} className="eye-icon">
          {isBalanceVisible ? '👁️' : '👁️‍🗨️'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="button-container">
        <button className="start-trade-button" onClick={() => setActiveComponent('trade-calculator')}>
          <FaArrowRight className="icon" /> Start Trade
        </button>
        <button className="withdraw-button" onClick={() => setActiveComponent('wallet')}>
          <FaMoneyCheckAlt className="icon" /> Withdraw
        </button>
        <button className="fund-button" onClick={() => setActiveComponent('trade-calculator')}>
          <FaDollarSign className="icon" /> Fund Account
        </button>
      </div>

      {/* Recent Transactions Card */}
      <div className="card recent-transactions-card">
        <h3>Recent Transactions</h3>
        {Array.isArray(recentTransactions) && recentTransactions.length > 0 ? (
          recentTransactions.map((transaction, index) => (
            <div className="transaction-card-1" key={transaction.id || index}>
              <div className="transaction-type">{transaction.type}</div>
              <div className="transaction-amount">₦{transaction.amount ? transaction.amount.toLocaleString() : '0'}</div>
              <div className={`transaction-status ${transaction.status.toLowerCase()}`}>{transaction.status}</div>
              {!isMobile && <div className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</div>}
            </div>
          ))
        ) : (
          <p>No recent transactions</p>
        )}

        <button className="see-more-button" onClick={() => setActiveComponent('transaction-history')}>
          See More
        </button>
      </div>
    </div>
  );
};

export default Overview;
