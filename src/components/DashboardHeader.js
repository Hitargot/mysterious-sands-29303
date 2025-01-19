import React, { useEffect, useState } from 'react';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Notifications from './Notifications';
import '../styles/DashboardHeader.css';

const DashboardHeader = ({
  clearJwtToken,
  setBankAccounts,
  setSelectedBankAccount,
  setWalletBalance,
  handleAlert,
  userInfo, // Assuming userInfo is passed as a prop
}) => {
  const [userName, setUserName] = useState(userInfo?.username || ''); // Set username from userInfo

  const navigate = useNavigate();

  const handleLogout = () => {
    clearJwtToken();
    localStorage.removeItem('username'); // Clear username on logout
    if (typeof setBankAccounts === 'function') {
      setBankAccounts([]);
    }
    setSelectedBankAccount?.(null);
    setWalletBalance?.(0);
    navigate('/login');
    handleAlert('Logged out successfully.', 'success');
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const navigateToProfile = () => {
    navigate('/profile');
  };

  return (
    <header className="dashboard-header">
      <h1>{`${getGreeting()}, ${userName || 'User'}`}</h1>
      <div className="header-icons">
        <Notifications />
        <FaUserCircle className="user-icon" aria-label="User Profile" onClick={navigateToProfile} />
        <button className="logout-button" onClick={handleLogout} aria-label="Logout">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
