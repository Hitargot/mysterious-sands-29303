import React, { useState, useEffect } from 'react';
import '../styles/Overview.css';
import { FaArrowRight, FaDollarSign, FaMoneyCheckAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const Overview = ({ setActiveComponent }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isBalanceVisible, setBalanceVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMobile = window.innerWidth <= 768;

  //const apiUrl = "http://localhost:22222";
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
        if (!token) return;
    
        // Fetch wallet, transactions, and trade confirmations
        const responses = await Promise.allSettled([
          axios.get(`${apiUrl}/api/wallet/data`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/transaction/transaction-history`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/confirmations`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
    
        const walletRes = responses[0].status === 'fulfilled' ? responses[0].value.data : null;
        const transactionsRes = responses[1].status === 'fulfilled' ? responses[1].value.data : null;
        const confirmationsRes = responses[2].status === 'fulfilled' ? responses[2].value.data : null;
    
        // Set wallet balance
        if (walletRes) {
          setWalletBalance(walletRes.balance || 0);
        }
    
        // Extract and format transactions
        const transactions = (transactionsRes?.transactions || []).map((t) => ({
          ...t,
          type: 'Withdrawal',
        }));
    
        // Extract trade confirmations
        const confirmations = (confirmationsRes?.confirmations || []).map((c) => ({
          ...c,
          type: 'Trade Confirmation',
          serviceName: c.serviceId?.name || 'N/A',
        }));
    
        // ✅ Fix: Extract funding transactions correctly
        const fundingTransactions = (walletRes?.transactions || []).filter((f) => f.type === "Funding").map((f) => ({
          ...f,
          type: 'Funding',
          amount: f.amount || 0,
          status: f.status || 'Funded',
        }));
    
        // Combine and sort all activities
        const combinedActivities = [...transactions, ...confirmations, ...fundingTransactions]
          .map((activity) => ({
            ...activity,
            time: new Date(activity.createdAt || activity.date).getTime(),
          }))
          .sort((a, b) => b.time - a.time);
    
        setRecentActivities(combinedActivities.slice(0, 3));
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };
    

    fetchData();
  }, []); // Add dependencies if needed

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
        {loading ? (
          <p>Loading...</p>
        ) : recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => (
            <div className="transaction-card-1" key={activity.transactionId || `activity-${index}`}>
              <div className="transaction-type">{activity.type}</div>
              <div className="transaction-amount">
                {activity.type === 'Withdrawal' || activity.type === 'Funding'
                  ? `₦${activity.amount ? activity.amount.toLocaleString() : '0'}`
                  : activity.type === 'Trade Confirmation'
                  ? activity.serviceName
                  : 'N/A'}
              </div>
              <div className={`transaction-status ${activity.status ? activity.status.toLowerCase() : ''}`}>
                {activity.status || 'N/A'}
              </div>
              {!isMobile ? (
                <div className="transaction-date">
                  {new Date(activity.createdAt || activity.date).toLocaleString()}
                </div>
              ) : (
                <div className="transaction-date-mobile">
                  {new Date(activity.createdAt || activity.date).toLocaleString('en-GB')}
                </div>
              )}
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
