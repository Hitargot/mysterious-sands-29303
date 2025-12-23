import React, { useState, Suspense, lazy, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
const TransferPage = lazy(() => import('../components/TransferPage'));
const CreatePreSubmission = lazy(() => import('../pages/CreatePreSubmission'));
const MyPreSubmissions = lazy(() => import('../pages/MyPreSubmissions'));


const UserDashboard = () => {
  const storedComponent = localStorage.getItem('activeComponent') || 'overview';
  const [activeComponent, setActiveComponent] = useState(storedComponent);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);


  // Function to handle alerts
  const handleAlert = (message, type) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const apiUrl = process.env.REACT_APP_API_URL;


  useEffect(() => {
    localStorage.setItem('activeComponent', activeComponent);
  }, [activeComponent]);

  // If a ?panel=... query param is present, open that panel inside the dashboard
  const location = useLocation();
  useEffect(() => {
    try {
      const qp = new URLSearchParams(location.search);
      const panel = qp.get('panel');
      if (panel) setActiveComponent(panel);
    } catch (e) {
      // ignore
    }
  }, [location.search]);

  // If the pathname includes a dashboard subpath (e.g. /dashboard/trade-history)
  // map it to the corresponding panel so each sidebar item can have a unique URL.
  useEffect(() => {
    try {
      const path = location.pathname || '';
      // Match /dashboard/<panel> and capture the panel slug
      const match = path.match(/^\/dashboard\/?([^/?]+)/);
      if (match && match[1]) {
        const panelFromPath = decodeURIComponent(match[1]);
        // Only update if different to avoid overwriting manually set state
        if (panelFromPath && panelFromPath !== activeComponent) {
          setActiveComponent(panelFromPath);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [location.pathname, activeComponent]);

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
      case 'create-presubmission':
        return <CreatePreSubmission />;
      case 'my-pre-submissions':
        return <MyPreSubmissions />;
      /* Chatbot disabled temporarily */
      case 'profile':
        return <Profile setActiveComponent={setActiveComponent} />;
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
        <DashboardHeader
          clearJwtToken={clearJwtToken}
          handleAlert={handleAlert}
          setActiveComponent={setActiveComponent}
        />
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
