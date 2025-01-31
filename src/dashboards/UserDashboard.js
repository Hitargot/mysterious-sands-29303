import React, { useState, Suspense, lazy, useEffect, useCallback } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';
import '../styles/UserDashboard.css';
import { getJwtToken, clearJwtToken } from '../utils/auth';
import axios from 'axios';

// Lazy load components
const Overview = lazy(() => import('../components/Overview'));
const TradeCalculator = lazy(() => import('../components/TradeCalculator'));
const TransactionHistory = lazy(() => import('../components/TransactionHistory'));
const Profile = lazy(() => import('../components/Profile'));
const TradeHistory = lazy(() => import('../components/TradeHistory'));
const Wallet = lazy(() => import('../components/WalletPage'));

// ErrorBoundary component for better error handling
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p>Something went wrong. Please try again later.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }

}

const UserDashboard = () => {
  // Retrieve activeComponent from localStorage or default to 'overview'
  const storedComponent = localStorage.getItem('activeComponent') || 'overview';
  const [activeComponent, setActiveComponent] = useState(storedComponent);

  // Function to handle alerts
  const handleAlert = (message, type) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  // const apiUrl = "http://localhost:22222";

  // Save activeComponent to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeComponent', activeComponent);
  }, [activeComponent]);

  // Fetch initial wallet and bank account data (example implementation)
  const fetchBankAccounts = useCallback(async () => {
    const token = getJwtToken(); // Retrieve token as needed
    try {
      await axios.get(`${apiUrl}/api/wallet/banks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      handleAlert(error.response?.data?.message || 'Failed to load bank accounts.', 'error');
    }
  }, [apiUrl]); // Empty dependency array to ensure it's only created once

  useEffect(() => {
    fetchBankAccounts(); // Now only runs once
  }, [fetchBankAccounts]); // The effect now only runs when fetchBankAccounts changes

  // Render component based on active selection
  const renderComponent = () => {
    switch (activeComponent) {
      case 'overview':
        return <Overview setActiveComponent={setActiveComponent} />;
      case 'trade-calculator':
        return <TradeCalculator />;
      case 'wallet':
        return <Wallet />;
      case 'transaction-history':
        return <TransactionHistory />;
      case 'trade-history':
        return <TradeHistory />;
      case 'profile':
        return <Profile />;
      default:
        console.error('Unknown component:', activeComponent);
        return <Overview setActiveComponent={setActiveComponent} />;
    }
  };

  return (
    <div className="dashboard">
      <DashboardHeader
        clearJwtToken={clearJwtToken}
        handleAlert={handleAlert}
      />
      <div className="dashboard-main">
        <Sidebar setActiveComponent={setActiveComponent} activeComponent={activeComponent} />
        <div className="dashboard-content">
          <ErrorBoundary>
            <Suspense fallback={<div className="spinner">Loading...</div>}>
              {renderComponent()}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
