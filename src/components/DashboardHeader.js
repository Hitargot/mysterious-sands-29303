import React, { useState, useEffect } from 'react';
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

  // Function to check token expiry
  const checkTokenExpiration = () => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds

        if (decodedToken.exp < currentTime) {
          handleAlert('Session expired. Please log in again.', 'error');
          handleLogout();
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        handleLogout();
      }
    }
  };

  // Auto-logout when token expires
  useEffect(() => {
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000); // Check every 1 minute
    return () => clearInterval(interval); // Cleanup
  }, []);

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
  }, [navigate, handleAlert]);  

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    clearJwtToken();
    localStorage.removeItem('jwtToken');
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

  const navigateToProfile = () => navigate('/profile');

  // 🔹 Inline Styles
  const styles = {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#162660', // Dark Blue
      color: '#f1e4d1', // Cream
      padding: '15px 25px',
      fontSize: '18px',
      fontWeight: '500',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    },
    greeting: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#d0e6fd', // Light Blue
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
    iconHover: {
      color: '#d0e6fd', // Light Blue
    },
    logoutButton: {
      backgroundColor: '#d0e6fd', // Light Blue
      color: '#162660', // Dark Blue
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
    logoutButtonHover: {
      backgroundColor: '#b5d4fa', // Lighter Blue
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
    navList: {
      listStyle: 'none',
      padding: 0,
      marginTop: '20px',
    },
    navItem: {
      padding: '15px',
      borderBottom: '1px solid #d0e6fd',
      cursor: 'pointer',
      transition: 'background 0.3s',
    },
    navItemHover: {
      background: '#1d3375',
    },
  };

  return (
    <header style={styles.header}>
      <h1 style={styles.greeting}>{`${getGreeting()}, ${userName}`}</h1>

      {/* Right section with icons */}
      <div style={styles.headerRight}>
        <Notifications style={styles.icon} />

        {!isMobile && (
          <>
            <FaUserCircle
              style={styles.icon}
              onClick={navigateToProfile}
              onMouseEnter={(e) => (e.target.style.color = styles.iconHover.color)}
              onMouseLeave={(e) => (e.target.style.color = '')}
              aria-label="User Profile"
            />
            <button
              style={styles.logoutButton}
              onClick={handleLogout}
              onMouseEnter={(e) => (e.target.style.backgroundColor = styles.logoutButtonHover.backgroundColor)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = styles.logoutButton.backgroundColor)}
              aria-label="Logout"
            >
              <FaSignOutAlt /> Logout
            </button>
          </>
        )}

        {/* Menu Icon for Mobile */}
        {isMobile && (
          <FaBars style={styles.menuIcon} onClick={() => setMenuOpen(true)} />
        )}
      </div>

      {/* Mobile Overlay Menu */}
      {isMobile && (
        <nav style={styles.navOverlay}>
          <FaTimes style={styles.closeButton} onClick={() => setMenuOpen(false)} />
          <ul style={styles.navList}>
            <li
              style={styles.navItem}
              onClick={navigateToProfile}
              onMouseEnter={(e) => (e.target.style.background = styles.navItemHover.background)}
              onMouseLeave={(e) => (e.target.style.background = '')}
            >
              Profile
            </li>
            <li
              style={styles.navItem}
              onClick={handleLogout}
              onMouseEnter={(e) => (e.target.style.background = styles.navItemHover.background)}
              onMouseLeave={(e) => (e.target.style.background = '')}
            >
              Logout
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default DashboardHeader;
