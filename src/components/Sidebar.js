import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCalculator, FaHistory, FaUser, FaWallet, FaBars } from 'react-icons/fa'; // Added FaBars for mobile menu
import Logo from '../assets/images/Exodollarium-01.png'; // Replace with your actual logo path
import '../styles/Sidebar.css';

const Sidebar = ({ setActiveComponent }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverlayActive, setIsOverlayActive] = useState(false); // State for overlay

  const toggleSidebar = () => {
    setIsOverlayActive(!isOverlayActive);
  };

  return (
    <>
      {/* Mobile menu icon to toggle sidebar */}
      <div className="menu-icon" onClick={toggleSidebar}>
        <FaBars />
      </div>

      {/* Sidebar overlay */}
      <div className={`sidebar-overlay ${isOverlayActive ? 'active' : ''}`}>
        <div className="sidebar">
          <button className="close-button" onClick={toggleSidebar}>×</button>

          <div className="sidebar-header" onClick={() => navigate('/')}>
            <img src={Logo} alt="Logo" className="logo-icon" />
            {isExpanded && <h2>Exdollarium</h2>}
          </div>

          <nav className="sidebar-nav">
            <button onClick={() => setActiveComponent('overview')}>
              <FaHome />
              {isExpanded && <span>Overview</span>}
            </button>
            <button onClick={() => setActiveComponent('trade-calculator')}>
              <FaCalculator />
              {isExpanded && <span>Trade Calculator</span>}
            </button>
            <button onClick={() => setActiveComponent('wallet')}>
              <FaWallet />
              {isExpanded && <span>Wallet</span>}
            </button>
            <button onClick={() => setActiveComponent('transaction-history')}>
              <FaHistory />
              {isExpanded && <span>Transaction History</span>}
            </button>
            <button onClick={() => setActiveComponent('profile')}>
              <FaUser />
              {isExpanded && <span>Profile</span>}
            </button>
          </nav>
        </div>
      </div>

      <div
        className={`sidebar ${isExpanded ? 'expanded' : ''}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Static sidebar for larger screens */}
        <div className="sidebar-header" onClick={() => navigate('/')}>
          <img src={Logo} alt="Logo" className="logo-icon" />
          {isExpanded && <h2>Exdollarium</h2>}
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => setActiveComponent('overview')}>
            <FaHome />
            {isExpanded && <span>Overview</span>}
          </button>
          <button onClick={() => setActiveComponent('trade-calculator')}>
            <FaCalculator />
            {isExpanded && <span>Trade Calculator</span>}
          </button>
          <button onClick={() => setActiveComponent('wallet')}>
            <FaWallet />
            {isExpanded && <span>Wallet</span>}
          </button>
          <button onClick={() => setActiveComponent('transaction-history')}>
            <FaHistory />
            {isExpanded && <span>Transaction History</span>}
          </button>
          <button onClick={() => setActiveComponent('profile')}>
            <FaUser />
            {isExpanded && <span>Profile</span>}
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
