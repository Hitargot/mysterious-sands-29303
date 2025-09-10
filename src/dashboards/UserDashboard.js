import React, { useState, Suspense, lazy, useEffect, useCallback } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';
import { getJwtToken, clearJwtToken } from '../utils/auth';
import axios from 'axios';

// Lazy load components
const Overview = lazy(() => import('../components/Overview'));
const TradeCalculator = lazy(() => import('../components/TradeCalculator'));
const TransactionHistory = lazy(() => import('../components/TransactionHistory'));
const Profile = lazy(() => import('../components/Profile'));
const TradeHistory = lazy(() => import('../components/TradeHistory'));
const Wallet = lazy(() => import('../components/WalletPage'));
const Chatbot = lazy(() => import('../components/Chatbot'));
const TransferPage = lazy(() => import('../components/TransferPage'));


const UserDashboard = () => {
  const storedComponent = localStorage.getItem('activeComponent') || 'overview';
  const [activeComponent, setActiveComponent] = useState(storedComponent);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);


  // Function to handle alerts
  const handleAlert = (message, type) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  // const apiUrl = "http://localhost:22222";



  useEffect(() => {
    localStorage.setItem('activeComponent', activeComponent);
  }, [activeComponent]);

  const fetchBankAccounts = useCallback(async () => {
    const token = getJwtToken();
    if (!token) return; // Prevent API call if no token

    try {
      await axios.get(`${apiUrl}/api/wallet/banks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to load bank accounts.", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'overview':
        return <Overview setActiveComponent={setActiveComponent} />;
      case 'trade-calculator':
        return <TradeCalculator />;
        case 'wallet':
          return <Wallet setActiveComponent={setActiveComponent} />;        
      case 'transaction-history':
        return <TransactionHistory />;
      case 'trade-history':
        return <TradeHistory />;
      case 'chat-bot':
        return <Chatbot />;
      case 'profile':
        return <Profile />;
      case 'transfer':
        return <TransferPage />;
      default:
        return <Overview setActiveComponent={setActiveComponent} />;
    }
  };

  // 🔹 Dynamic Sidebar Width
  const sidebarWidth = isSidebarExpanded ? '250px' : '70px';

  // 🔹 Styles
  const styles = {
    dashboard: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f5f5f5',
    },
    header: {
      position: 'sticky',
      top: '0',
      width: '100%',
      backgroundColor: '#ffffff',
      zIndex: '1000',
      boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
    },
    dashboardMain: {
      display: 'flex',
      flex: 1,
      // overflow: 'hidden',
    },
    sidebarContainer: {
      width: sidebarWidth,
      transition: 'width 0.3s ease',
    },
    contentContainer: {
      flex: 1,
      padding: '20px',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      // margin: '20px',
      overflowY: 'auto',
      height: 'calc(100vh - 70px)',
      transition: 'margin-left 0.3s ease',
    },
  };

  return (
    <div style={styles.dashboard}>
      {/* Sticky Header */}
      <div style={styles.header}>
        <DashboardHeader clearJwtToken={clearJwtToken} handleAlert={handleAlert} />
      </div>

      <div style={styles.dashboardMain}>
        {/* Sidebar with Expandable Width */}
        <div style={styles.sidebarContainer}>
          <Sidebar
            setActiveComponent={setActiveComponent}
            activeComponent={activeComponent}
            setIsSidebarExpanded={setIsSidebarExpanded} // Send state handler to Sidebar
          />
        </div>

        {/* Content Area (Adjusted Based on Sidebar State) */}
        <div style={styles.contentContainer}>
          <Suspense fallback={<div className="spinner">Loading...</div>}>
            {renderComponent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
