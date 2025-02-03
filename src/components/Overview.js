import React, { useState, useEffect } from 'react';
import '../styles/Overview.css';
import { FaArrowRight, FaDollarSign, FaMoneyCheckAlt } from 'react-icons/fa';
import axios from 'axios'; // Don't forget to import axios

const Overview = ({ setActiveComponent }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isBalanceVisible, setBalanceVisible] = useState(false);
  const isMobile = window.innerWidth <= 768;

  const apiUrl = "http://localhost:22222";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
        
        // Fetch wallet balance
        const balanceResponse = await fetch(`${apiUrl}/api/wallet/data`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const balanceData = await balanceResponse.json();
        setWalletBalance(balanceData.balance);

        // Fetch recent transactions
        const transactionsResponse = await fetch(`${apiUrl}/api/transaction/transaction-history`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const transactionsData = await transactionsResponse.json();

        // Fetch confirmations
        const confirmationsResponse = await axios.get(`${apiUrl}/api/confirmations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const transactions = transactionsData.transactions.map((transaction) => ({
          ...transaction,
          type: 'Transaction',
        }));

        const confirmations = confirmationsResponse.data.confirmations.map((confirmation) => ({
          ...confirmation,
          type: 'Confirmation',
        }));

        // Combine transactions and confirmations and sort them by the latest date
        const combinedActivities = [...transactions, ...confirmations].sort(
          (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );

        // Set the combined activities
        setRecentActivities(combinedActivities.slice(0, 3)); // Show the latest 3 activities
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

      {/* Recent Activities Card */}
      <div className="card recent-transactions-card">
        <h3>Recent Activities</h3>
        {Array.isArray(recentActivities) && recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => (
            <div className="transaction-card-1" key={activity.id || index}>
              <div className="transaction-type">{activity.type}</div>
              <div className="transaction-amount">
                {activity.type === 'Transaction' 
                  ? `₦${activity.amount ? activity.amount.toLocaleString() : '0'}` 
                  : activity.type === 'Confirmation'
                  ? activity.serviceId?.name
                  : 'N/A'}
              </div>
              <div className={`transaction-status ${activity.status ? activity.status.toLowerCase() : ''}`}>
                {activity.status || 'N/A'}
              </div>
              {!isMobile && <div className="transaction-date">{new Date(activity.createdAt || activity.date).toLocaleDateString()}</div>}
            </div>
          ))
        ) : (
          <p>No recent activities</p>
        )}

        <button className="see-more-button" onClick={() => setActiveComponent('transaction-history')}>
          See More
        </button>
      </div>
    </div>
  );
};

export default Overview;
