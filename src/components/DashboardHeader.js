import React, { useState, useEffect, useCallback } from 'react';
import { FaBars, FaSignOutAlt, FaUserCircle, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Notifications from './Notifications';
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
  const [userName, setUserName] = useState('User');
  const [logoutHover, setLogoutHover] = useState(false);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // ✅ Move handleLogout above checkTokenExpiration
  const handleLogout = useCallback(() => {
    clearJwtToken();
    localStorage.removeItem('jwtToken');
  
    if (setBankAccounts) {
      setBankAccounts([]);
    }
  
    if (setSelectedBankAccount) {
      setSelectedBankAccount(null);
    }
  
    if (setWalletBalance) {
      setWalletBalance(0);
    }
  
    handleAlert('Logged out successfully.', 'success');
  
    // 👇 Add this line to redirect after logout
    navigate('/login'); // or '/auth', depending on your route
  }, [clearJwtToken, setBankAccounts, setSelectedBankAccount, setWalletBalance, handleAlert, navigate]);
  

  // ✅ Now handleLogout is defined before use
  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          handleAlert('Session expired. Please log in again.', 'error');
          handleLogout();
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        handleLogout();
      }
    }
  }, [handleAlert, handleLogout]);

  // Auto-logout on token expiry
  useEffect(() => {
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [checkTokenExpiration]);

  useEffect(() => {
    const fetchUserFromLocalStorage = () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (token) {
          try {
            const decodedToken = jwtDecode(token);
            const extractedUsername = decodedToken?.username || 'User';
            setUserName(extractedUsername);
          } catch (error) {
            handleAlert('Session expired. Please log in again.', 'error');
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    };

    fetchUserFromLocalStorage();
  }, [navigate, handleAlert, handleLogout]);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const navigateToProfile = () => navigate('/profile');


  // Styles
  const styles = {
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#162660",
      color: "#f1e4d1",
      padding: "15px 25px",
      fontSize: "18px",
      fontWeight: "500",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
      paddingTop: "calc(15px + env(safe-area-inset-top))", // Adjust for iPhone notch
    },
    greeting: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#d0e6fd',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
    },
    icon: {
      fontSize: '24px',
      cursor: 'pointer',
      transition: 'color 0.3s ease-in-out',
    },
    logoutButton: {
      backgroundColor: logoutHover ? '#b5d4fa' : '#d0e6fd',
      color: '#162660',
      padding: '8px 15px',
      border: 'none',
      borderRadius: '5px',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      transition: 'background-color 0.3s ease-in-out',
    },
    menuIcon: {
      fontSize: '28px',
      cursor: 'pointer',
      color: '#d0e6fd',
    },
    navOverlay: {
      position: 'fixed',
      top: 0,
      right: 0,
      width: '70%',
      height: '100%',
      backgroundColor: '#162660',
      boxShadow: '-4px 0px 10px rgba(0, 0, 0, 0.2)',
      transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      zIndex: 1000,
      padding: '20px',
    },
    closeButton: {
      fontSize: '26px',
      cursor: 'pointer',
      color: '#d0e6fd',
    },
  };

  return (
    <header style={styles.header}>
      <h1 style={styles.greeting}>{`${getGreeting()}, ${userName}`}</h1>

      <div style={styles.headerRight}>
        <Notifications style={styles.icon} />

        {!isMobile && (
          <>
            <FaUserCircle style={styles.icon} onClick={navigateToProfile} />
            <button
              style={styles.logoutButton}
              onClick={handleLogout}
              onMouseEnter={() => setLogoutHover(true)}
              onMouseLeave={() => setLogoutHover(false)}
            >
              <FaSignOutAlt /> Logout
            </button>
          </>
        )}

        {isMobile && <FaBars style={styles.menuIcon} onClick={() => setMenuOpen(true)} />}
      </div>

      {isMobile && (
        <nav style={styles.navOverlay}>
          <FaTimes style={styles.closeButton} onClick={() => setMenuOpen(false)} />
          <ul>
            <li onClick={navigateToProfile} style={{ padding: '15px', cursor: 'pointer' }}>
              Profile
            </li>
            <li onClick={handleLogout} style={{ padding: '15px', cursor: 'pointer' }}>
              Logout
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default DashboardHeader;
