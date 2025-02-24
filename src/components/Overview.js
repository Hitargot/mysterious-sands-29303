import React, { useState, useEffect } from 'react';
import { FaArrowRight, FaDollarSign, FaMoneyCheckAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const Overview = ({ setActiveComponent }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isBalanceVisible, setBalanceVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isHovered, setIsHovered] = useState({});
  const [isCardHovered, setIsCardHovered] = useState(false); // Wallet Balance Card hover state

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
        if (!token) return;

        const responses = await Promise.allSettled([
          axios.get(`${apiUrl}/api/wallet/data`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/transaction/transaction-history`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/confirmations`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const walletRes = responses[0].status === 'fulfilled' ? responses[0].value.data : null;
        const transactionsRes = responses[1].status === 'fulfilled' ? responses[1].value.data : null;
        const confirmationsRes = responses[2].status === 'fulfilled' ? responses[2].value.data : null;

        if (walletRes) {
          setWalletBalance(walletRes.balance || 0);
        }

        const transactions = (transactionsRes?.transactions || []).map((t) => ({
          ...t,
          type: 'Withdrawal',
        }));

        const confirmations = (confirmationsRes?.confirmations || []).map((c) => ({
          ...c,
          type: 'Trade Confirmation',
          serviceName: c.serviceId?.name || 'N/A',
        }));

        const fundingTransactions = (walletRes?.transactions || [])
          .filter((f) => f.type === "Funding")
          .map((f) => ({
            ...f,
            type: 'Funding',
            amount: f.amount || 0,
            status: f.status || 'Funded',
          }));

        const combinedActivities = [...transactions, ...confirmations, ...fundingTransactions]
          .map((activity) => ({
            ...activity,
            time: new Date(activity.createdAt || activity.date).getTime(),
          }))
          .sort((a, b) => b.time - a.time);

        setRecentActivities(combinedActivities.slice(0, 3));
        setIsHovered(new Array(combinedActivities.length).fill(false)); // Initialize hover states
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={styles.overview}>
      {/* Wallet Balance Card */}
      <div
        style={{
          ...styles.card,
          ...styles.balanceCard,
          ...(isCardHovered ? styles.balanceCardHover : {}),
        }}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
      >
        <h3 style={styles.walletBalanceHeading}>Wallet Balance</h3>
        <p style={styles.balanceAmount}>
          {isBalanceVisible ? `₦${walletBalance.toLocaleString()}` : '****'}
        </p>
        <span onClick={() => setBalanceVisible(!isBalanceVisible)} style={styles.eyeIcon}>
          {isBalanceVisible ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      {/* Action Buttons */}
      <div style={styles.buttonContainer}>
        {['trade-calculator', 'wallet', 'trade-calculator'].map((component, index) => (
          <button
            key={index}
            style={styles.button}
            onClick={() => setActiveComponent(component)}
            onMouseEnter={(e) => (e.target.style = { ...styles.button, ...styles.buttonHover })}
            onMouseLeave={(e) => (e.target.style = styles.button)}
          >
            {index === 0 && <FaArrowRight style={styles.icon} />} 
            {index === 1 && <FaMoneyCheckAlt style={styles.icon} />} 
            {index === 2 && <FaDollarSign style={styles.icon} />} 
            {index === 0 ? 'Start Trade' : index === 1 ? 'Withdraw' : 'Fund Account'}
          </button>
        ))}
      </div>

      {/* Recent Activities Card */}
      <div style={{ ...styles.card, ...styles.recentTransactionsCard }}>
      <h3 style={styles.recentActivitiesHeading}>Recent Activities</h3>
        {loading ? (
          <p>Loading...</p>
        ) : recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => (
            <div
              key={activity.transactionId || `activity-${index}`}
              style={{
                ...styles.transactionCard,
                ...(isHovered[index] ? styles.transactionCardHover : {}),
                flexDirection: isMobile ? 'column' : 'row', // Dynamically adjust layout
                alignItems: isMobile ? 'flex-start' : 'center',
              }}
              onMouseEnter={() =>
                setIsHovered((prev) => prev.map((val, i) => (i === index ? true : val)))
              }
              onMouseLeave={() =>
                setIsHovered((prev) => prev.map((val, i) => (i === index ? false : val)))
              }
            >
              <div style={styles.transactionText}>{activity.type}</div>
              <div style={styles.transactionText}>
                {activity.type === 'Withdrawal' || activity.type === 'Funding'
                  ? `₦${activity.amount ? activity.amount.toLocaleString() : '0'}`
                  : activity.type === 'Trade Confirmation'
                  ? activity.serviceName
                  : 'N/A'}
              </div>
              <div style={{ ...styles.transactionText, color: activity.status === 'Funded' ? '#28a745' : '#dc3545' }}>
                {activity.status || 'N/A'}
              </div>
              <div style={styles.transactionText}>
                {new Date(activity.createdAt || activity.date).toLocaleString('en-GB')}
              </div>
            </div>
          ))
        ) : (
          <p>No recent activities</p>
        )}

<button style={{ ...styles.button, ...styles.seeMoreButton }} onClick={() => setActiveComponent('transaction-history')}>
          See More
        </button>
      </div>
    </div>
  );
};


// Styles Object for Inline Styling
const styles = {
  overview: {
    padding: '20px',
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: '#f4f4f4',
    overflow: 'hidden',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '12px',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    marginBottom: '20px',
    transition: 'all 0.3s ease-in-out',
  },
  balanceCard: {
    textAlign: 'center',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    background: '#162660',
  },
  balanceCardHover: {
    transform: 'scale(1.01)',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
  },
  balanceAmount: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#f1e4d1',
  },
  eyeIcon: {
    cursor: 'pointer',
    fontSize: '20px',
    marginTop: '12px',
    color: '#d0e6fd',
    transition: 'color 0.3s ease',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  button: {
    padding: '12px 24px',
    background: '#d0e6fd',  //#162660
    color: '#162660',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  buttonHover: {
    background: '#162660',
    transform: 'scale(1.05)',
  },
  icon: {
    marginRight: '10px',
  },
  recentTransactionsCard: {
    display: 'flex',
    flexDirection: 'column',
  },
  transactionCard: {
    display: 'flex',
    flexWrap: 'wrap',  // Allow wrapping for smaller screens
    justifyContent: 'space-between',
    padding: '12px',
    marginBottom: '12px',
    background: '#162660',
    borderRadius: '10px',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    flexDirection: window.innerWidth <= 768 ? 'column' : 'row', // Stack items on mobile
    alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
  },  
  transactionCardHover: {
    transform: 'scale(1.02)',
    boxShadow: '0 5px 12px #f1e4d1',
  },
  transactionText: {
    flex: 1,
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500',
    color: '#d0e6fd',
  },
  seeMoreButton: {
    alignSelf: 'center',
    marginTop: '15px',
  },
 recentActivitiesHeading: {
    fontSize: '20px', 
    fontWeight: 'bold', 
    color: '#162660', // Vibrant blue
    borderBottom: '2px solid #007bff', // Underline effect
    paddingBottom: '5px',
    marginBottom: '15px',
    textTransform: 'uppercase', // Optional: Makes text uppercase
  },
  walletBalanceHeading: {
    fontSize: '20px', 
    fontWeight: 'bold', 
    color: '#d0e6fd', // Vibrant blue
    paddingBottom: '5px',
    marginBottom: '15px',
    textTransform: 'uppercase', // Optional: Makes text uppercase
  },
};

export default Overview;
