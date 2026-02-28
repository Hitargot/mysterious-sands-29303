import React, { useState, Suspense, lazy, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';
import { getJwtToken, clearJwtToken } from '../utils/auth';
import { ThemeProvider } from '../context/ThemeContext';
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
const KYCPage = lazy(() => import('../components/KYCPage'));
const SettingsPage = lazy(() => import('../components/SettingsPage'));


const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedComponent = localStorage.getItem('activeComponent') || 'overview';
  const [activeComponent, setActiveComponent] = useState(storedComponent);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Single source of truth for panel navigation ──
  // Always updates both state and URL so the pathname-watcher never fights back.
  const navigateTo = useCallback((panel) => {
    setActiveComponent(panel);
    navigate(`/dashboard/${panel}`, { replace: true });
  }, [navigate]);
  // Function to handle alerts
  const handleAlert = (message, type) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const apiUrl = process.env.REACT_APP_API_URL;


  useEffect(() => {
    localStorage.setItem('activeComponent', activeComponent);
  }, [activeComponent]);

  // Sync from URL on first load and when the user navigates with browser back/forward.
  // Uses location.key so it only fires on genuine navigation events, not on our own
  // navigate() calls (which already set state directly via navigateTo).
  useEffect(() => {
    try {
      const qp = new URLSearchParams(location.search);
      const panelFromQuery = qp.get('panel');
      if (panelFromQuery) { setActiveComponent(panelFromQuery); return; }

      const match = location.pathname.match(/^\/dashboard\/?([^/?]+)/);
      if (match && match[1]) {
        const panelFromPath = decodeURIComponent(match[1]);
        setActiveComponent(panelFromPath);
      }
    } catch (e) { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]); // ← location.key changes only on real navigations

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
        return <Overview setActiveComponent={navigateTo} />;
      case 'trade-calculator':
        return <TradeCalculator />;
      case 'wallet':
        return <Wallet setActiveComponent={navigateTo} />;
      case 'transaction-history':
        return <TransactionHistory />;
      case 'trade-history':
        return <TradeHistory />;
      case 'create-presubmission':
        return <CreatePreSubmission />;
      case 'my-pre-submissions':
        return <MyPreSubmissions />;
      case 'profile':
        return <Profile setActiveComponent={navigateTo} />;
      case 'kyc':
        return <KYCPage />;
      case 'transfer':
        return <TransferPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Overview setActiveComponent={navigateTo} />;
    }
  };

  // 🔹 Styles
  const styles = {
    dashboard: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'linear-gradient(135deg,#0A0F1E 0%,#0F172A 60%,#111827 100%)',
    },
    header: {
      position: 'sticky',
      top: '0',
      width: '100%',
      zIndex: '1000',
      // On desktop, shift header right so it sits beside the fixed sidebar
      paddingLeft: isMobile ? '0' : '260px',
      boxSizing: 'border-box',
    },
    dashboardMain: {
      display: 'flex',
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      // On desktop, push content past the fixed 260px sidebar
      marginLeft: isMobile ? '0' : '260px',
      padding: '16px 20px',
      background: 'transparent',
      overflowY: 'auto',
      height: 'calc(100vh - 64px)',
    },
  };

  return (
    <ThemeProvider>
    <div style={styles.dashboard}>
      {/* Sticky Header */}
      <div style={styles.header}>
        <DashboardHeader
          clearJwtToken={clearJwtToken}
          handleAlert={handleAlert}
          setActiveComponent={navigateTo}
        />
      </div>

      <div style={styles.dashboardMain}>
        {/* Fixed-position drawer sidebar */}
        <Sidebar
          setActiveComponent={navigateTo}
          activeComponent={activeComponent}
          clearJwtToken={clearJwtToken}
          handleAlert={handleAlert}
        />

        {/* Content Area (Adjusted Based on Sidebar State) */}
        <div style={styles.contentContainer}>
          <Suspense fallback={<div className="spinner">Loading...</div>}>
            {renderComponent()}
          </Suspense>
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
};

export default UserDashboard;
