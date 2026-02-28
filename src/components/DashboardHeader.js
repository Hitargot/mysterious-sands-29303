import React, { useState, useEffect, useCallback } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Notifications from './Notifications';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const DashboardHeader = ({
  clearJwtToken,
  setBankAccounts,
  setSelectedBankAccount,
  setWalletBalance,
  handleAlert,
  showProfileInHeader = true,
  setActiveComponent,
}) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [kycApproved, setKycApproved] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const apiUrl = process.env.REACT_APP_API_URL || '';

  // ── handleLogout (kept here for token expiry auto-logout) ──
  const handleLogout = useCallback(() => {
    if (clearJwtToken) clearJwtToken();
    localStorage.removeItem('jwtToken');
    if (setBankAccounts) setBankAccounts([]);
    if (setSelectedBankAccount) setSelectedBankAccount(null);
    if (setWalletBalance) setWalletBalance(0);
    if (handleAlert) handleAlert('Logged out successfully.', 'success');
    navigate('/login');
  }, [clearJwtToken, setBankAccounts, setSelectedBankAccount, setWalletBalance, handleAlert, navigate]);

  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) {
          if (handleAlert) handleAlert('Session expired. Please log in again.', 'error');
          handleLogout();
        }
      } catch {
        handleLogout();
      }
    }
  }, [handleAlert, handleLogout]);

  useEffect(() => {
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [checkTokenExpiration]);

  useEffect(() => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        const decoded = jwtDecode(token);
        setUserName(decoded?.username || 'User');
      }
    } catch {
      handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token || !apiUrl) return;
    axios.get(`${apiUrl}/api/kyc/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { if (res.data?.kyc?.status === 'approved') setKycApproved(true); })
      .catch(() => {});
  }, [apiUrl]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'linear-gradient(90deg,#0A0F1E 0%,#0F172A 100%)',
      color: '#F1F5F9',
      // Mobile: 62px left pad so content clears the fixed hamburger button
      // Desktop: 20px — sidebar offset is handled by UserDashboard's paddingLeft
      padding: isMobile ? '0 20px 0 62px' : '0 20px',
      height: '64px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      borderBottom: '1px solid rgba(245,166,35,0.15)',
      paddingTop: 'calc(0px + env(safe-area-inset-top))',
      position: 'relative', zIndex: 900,
    }}>
      {/* Greeting + verified badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#F5A623', letterSpacing: '0.02em', margin: 0 }}>
          {`${getGreeting()}, ${userName}`}
        </h1>
        {kycApproved && (
          <span title="Identity Verified" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '20px', height: '20px', borderRadius: '50%',
            background: '#1d9bf0', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      {/* Right: notifications + profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Notifications style={{ fontSize: '22px', cursor: 'pointer', color: '#94A3B8' }} />
        {showProfileInHeader && (
          <FaUserCircle
            style={{ fontSize: '22px', cursor: 'pointer', color: '#94A3B8' }}
            onClick={() => setActiveComponent ? setActiveComponent('profile') : navigate('/profile')}
          />
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;

