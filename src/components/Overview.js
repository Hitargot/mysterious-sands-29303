import React, { useState, useEffect } from 'react';
import '../styles/Overview.css';
import { FaArrowRight, FaDollarSign, FaMoneyCheckAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

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
        if (!token) return;

        const [balanceRes, transactionsRes, confirmationsRes] = await Promise.all([
          fetch(`${apiUrl}/api/wallet/data`, { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/transaction/transaction-history`, { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/confirmations`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const balanceData = await balanceRes.json();
        const transactionsData = await transactionsRes.json();
        const confirmationsData = confirmationsRes.data;

        setWalletBalance(balanceData?.balance || 0);

        const transactions = (transactionsData?.transactions || []).map((t) => ({
          ...t,
          type: 'withdrawal',
        }));

        const confirmations = confirmationsData.confirmations.map((confirmation) => ({
          ...confirmation,
          type: 'Trade Confirmation',
          serviceName: confirmation.serviceId?.name || 'N/A', // Fetch service name
        }));

        const combinedActivities = [...transactions, ...confirmations].map((activity) => {
            // Add a time field to each activity based on its createdAt or date
            return {
                ...activity,
                time: new Date(activity.createdAt || activity.date).getTime(), // Convert to timestamp for easier comparison
            };
        }).sort((a, b) => b.time - a.time); // Sort by the time in descending order
        

        setRecentActivities(combinedActivities.slice(0, 3));
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      }
    };

    fetchData();
  }, []); // ✅ `useEffect` now correctly wraps `fetchData()`

  return (
    <div className="overview">
      {/* Wallet Balance Card */}
      <div className="card balance-card">
        <h3>Wallet Balance</h3>
        <p className="balance-amount">
          {isBalanceVisible ? `₦${walletBalance.toLocaleString()}` : '****'}
        </p>
        <span onClick={() => setBalanceVisible(!isBalanceVisible)} className="eye-icon">
          {isBalanceVisible ? <FaEyeSlash /> : <FaEye />}
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
        {recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => (
            <div className="transaction-card-1" key={activity.id || index}>
              <div className="transaction-type">{activity.type}</div>
              <div className="transaction-amount">
                {activity.type === 'withdrawal' 
                  ? `₦${activity.amount ? activity.amount.toLocaleString() : '0'}` 
                  : activity.type === 'Trade Confirmation' || activity.type === 'Confirmation'
                  ? activity.serviceName // Show service name for trades and confirmations
                  : 'N/A'}
              </div>
              <div className={`transaction-status ${activity.status ? activity.status.toLowerCase() : ''}`}>
                {activity.status || 'N/A'}
              </div>
              {
    !isMobile ? (
        <div className="transaction-date">
            {new Date(activity.createdAt || activity.date).toLocaleString()}
        </div>
    ) : (
        <div className="transaction-date-mobile">
            {new Date(activity.createdAt || activity.date).toLocaleString('en-GB')}
        </div>
    )
}
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
