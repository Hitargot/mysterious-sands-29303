import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCalculator, FaHistory, FaUser, FaWallet, FaExchangeAlt } from 'react-icons/fa'; // Added FaExchangeAlt for Trade History
import Logo from '../assets/images/Exodollarium-01.png'; // Ensure correct path for your logo
import '../styles/Sidebar.css';

const Sidebar = ({ setActiveComponent }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`sidebar ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-header" onClick={() => navigate('/')}>
        <img src={Logo} alt="Logo" className="logo-icon" />
        {isExpanded && <h2>Exdollarium</h2>}
      </div>

      <nav className="sidebar-nav">
        <button onClick={() => setActiveComponent('overview')} aria-label="Go to Overview">
          <FaHome />
          {isExpanded && <span>Overview</span>}
        </button>
        <button onClick={() => setActiveComponent('trade-calculator')} aria-label="Go to Trade Calculator">
          <FaCalculator />
          {isExpanded && <span>Trade Calculator</span>}
        </button>
        <button onClick={() => setActiveComponent('wallet')} aria-label="Go to Wallet">
          <FaWallet />
          {isExpanded && <span>Wallet</span>}
        </button>
        <button onClick={() => setActiveComponent('transaction-history')} aria-label="Go to Transaction History">
          <FaHistory />
          {isExpanded && <span>Transaction History</span>}
        </button>
        <button onClick={() => setActiveComponent('trade-history')} aria-label="Go to Trade History">
          <FaExchangeAlt /> {/* Use a different icon for Trade History */}
          {isExpanded && <span>Trade History</span>}
        </button>
        <button onClick={() => setActiveComponent('profile')} aria-label="Go to Profile">
          <FaUser />
          {isExpanded && <span>Profile</span>}
        </button>
        {/* <button onClick={() => setActiveComponent('chatbot')} aria-label="Go to Chat Bot">
          <FaUser />
          {isExpanded && <span>Chat bot</span>}
        </button> */}
      </nav>
    </div>
  );
};

export default Sidebar;
