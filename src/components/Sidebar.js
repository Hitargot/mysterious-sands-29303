import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCalculator, FaHistory, FaUser, FaWallet, FaExchangeAlt, FaPlusCircle, FaClipboardList } from 'react-icons/fa';
import { GiReceiveMoney } from 'react-icons/gi';
import ResponsiveLogo from './ResponsiveLogo';

const Sidebar = ({ setActiveComponent, activeComponent }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null); // Track hovered item

  // 🔹 Sidebar Items
  const menuItems = [
    { label: 'Overview', icon: <FaHome />, component: 'overview' },
    { label: 'Trade Calculator', icon: <FaCalculator />, component: 'trade-calculator' },
    { label: 'Create Pre-submission', icon: <FaPlusCircle />, component: 'create-presubmission' },
    { label: 'My Pre-submissions', icon: <FaClipboardList />, component: 'my-pre-submissions' },
    { label: 'Wallet', icon: <FaWallet />, component: 'wallet' },
    { label: 'Transfer', icon: <GiReceiveMoney />, component: 'transfer' },
    { label: 'Transaction History', icon: <FaHistory />, component: 'transaction-history' },
    { label: 'Trade History', icon: <FaExchangeAlt />, component: 'trade-history' },
    { label: 'Profile', icon: <FaUser />, component: 'profile' },
    // Chat bot temporarily removed
  ];

  // 🔹 Inline Styles
  const styles = {
    sidebar: {
      width: isExpanded ? '220px' : '72px',
      height: 'calc(100vh - 70px)',
      background: 'linear-gradient(180deg, #0f2a63 0%, #162660 100%)',
      color: '#f0f6ff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '12px',
      position: 'sticky',
      top: '70px',
      transition: 'width 0.25s ease-in-out',
      boxShadow: '4px 0px 12px rgba(0, 0, 0, 0.12)',
      overflow: 'hidden',
    },
    sidebarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isExpanded ? 'center' : 'flex-start',
      gap: '10px',
      cursor: 'pointer',
      paddingBottom: '18px',
      width: '100%',
      paddingLeft: isExpanded ? '0' : '10px',
    },
    logoIcon: {
      width: isExpanded ? '48px' : '36px',
      height: isExpanded ? '48px' : '36px',
      cursor: 'pointer',
      borderRadius: 8,
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    },
    nav: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      overflowY: 'auto',
      paddingBottom: '20px',
      // let nav take remaining space and scroll when content overflows
      flex: '1 1 auto',
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
        <ResponsiveLogo variant="small" alt="Exdollarium" style={styles.logoIcon} />
        {isExpanded && <h2 style={{ fontSize: '18px', color: '#f1e4d1' }}>Exdollarium</h2>}
      </div>

      {/* Navigation Buttons */}
      <nav style={styles.nav}>
        {menuItems.map(({ label, icon, component }) => (
          <button
            key={label}
            onClick={() => {
              // update the dashboard URL so each sidebar item has a unique link
              navigate(`/dashboard/${component}`);
              setActiveComponent(component);
            }}
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
