import React, { useState, useEffect } from 'react';
import { FaBars, FaSignOutAlt, FaUserCircle, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Notifications from './Notifications';
import '../styles/DashboardHeader.css';
import { jwtDecode } from 'jwt-decode';

const DashboardHeader = ({
  clearJwtToken,
  setBankAccounts,
  setSelectedBankAccount,
  setWalletBalance,
  handleAlert,
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  let userName = 'User';
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      userName = decodedToken?.username || 'User';
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    handleAlert('Session expired. Please log in again.', 'error');
    navigate('/login');
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    clearJwtToken();
    localStorage.removeItem('token');
    setBankAccounts?.([]);
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
      <h1>{`${getGreeting()}, ${userName}`}</h1>

      {/* Right section with icons */}
      <div className="header-right">
        <Notifications className="notification-icon" />

        {!isMobile && (
          <>
            <FaUserCircle className="user-icon" onClick={navigateToProfile} aria-label="User Profile" />
            <button className="logout-button" onClick={handleLogout} aria-label="Logout">
              <FaSignOutAlt /> Logout
            </button>
          </>
        )}

        {/* Menu Icon for Mobile */}
        {isMobile && <FaBars className="menu-icon" onClick={() => setMenuOpen(true)} />}
      </div>

      {/* Mobile Overlay Menu */}
      {isMobile && (
        <nav className={`nav-overlay ${menuOpen ? 'open' : ''}`}>
          <div className="nav-content">
            <FaTimes className="close-btn" onClick={() => setMenuOpen(false)} />
            <ul>
              <li onClick={navigateToProfile}>Profile</li>
              <li onClick={handleLogout}>Logout</li>
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
};

export default DashboardHeader;
