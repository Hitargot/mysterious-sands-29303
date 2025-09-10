import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCalculator, FaHistory, FaUser, FaWallet, FaExchangeAlt, FaRobot } from 'react-icons/fa';
import { GiReceiveMoney } from 'react-icons/gi';
import Logo from '../assets/images/Exodollarium-01.png'; // Ensure correct path

const Sidebar = ({ setActiveComponent, activeComponent }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null); // Track hovered item

  // 🔹 Sidebar Items
  const menuItems = [
    { label: 'Overview', icon: <FaHome />, component: 'overview' },
    { label: 'Trade Calculator', icon: <FaCalculator />, component: 'trade-calculator' },
    { label: 'Wallet', icon: <FaWallet />, component: 'wallet' },
    { label: 'Transfer', icon: <GiReceiveMoney />, component: 'transfer' },
    { label: 'Transaction History', icon: <FaHistory />, component: 'transaction-history' },
    { label: 'Trade History', icon: <FaExchangeAlt />, component: 'trade-history' },
    { label: 'Profile', icon: <FaUser />, component: 'profile' },
    { label: 'Chat bot', icon: <FaRobot />, component: 'chat-bot' },  ];

  // 🔹 Inline Styles
  const styles = {
    sidebar: {
      width: isExpanded ? '200px' : '70px',
      height: '100vh',
      backgroundColor: '#162660', // Dark Blue
      color: '#d0e6fd', // Light Blue
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '20px',
      position: 'fixed',
      transition: 'width 0.3s ease-in-out',
      boxShadow: '4px 0px 8px rgba(0, 0, 0, 0.2)',
    },
    sidebarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isExpanded ? 'center' : 'flex-start',
      gap: '10px',
      cursor: 'pointer',
      paddingBottom: '20px',
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      cursor: 'pointer',
    },
    nav: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    },
    button: (isActive, isHovered) => ({
      display: 'flex',
      alignItems: 'center',
      gap: isExpanded ? '12px' : '0px',
      padding: '12px',
      fontSize: '16px',
      color: '#d0e6fd',
      background: isActive ? '#1d3375' : isHovered ? '#1f3b82' : 'transparent', // Highlight active & hover
      border: 'none',
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'background 0.3s ease-in-out',
    }),
    icon: {
      fontSize: '20px',
      minWidth: '30px',
    },
  };

  return (
    <div
      style={styles.sidebar}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo and Title */}
      <div style={styles.sidebarHeader} onClick={() => navigate('/')}>
        <img src={Logo} alt="Logo" style={styles.logoIcon} />
        {isExpanded && <h2 style={{ fontSize: '18px', color: '#f1e4d1' }}>Exdollarium</h2>}
      </div>

      {/* Navigation Buttons */}
      <nav style={styles.nav}>
        {menuItems.map(({ label, icon, component }) => (
          <button
            key={label}
            onClick={() => setActiveComponent(component)}
            style={styles.button(activeComponent === component, hoveredItem === component)}
            onMouseEnter={() => setHoveredItem(component)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span style={styles.icon}>{icon}</span>
            {isExpanded && <span>{label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
