import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaExchangeAlt, 
  FaMoneyBillWave, 
  FaWallet, 
  FaCogs, 
  FaUserShield, 
  FaClipboardList, 
  FaBell, 
  FaAddressBook 
} from 'react-icons/fa'; // Icons for Admin Sidebar
import Logo from '../assets/images/Exodollarium-01.png'; // Adjust logo path accordingly
import '../styles/Sidebar.css'; // Ensure styles are correctly imported

const AdminSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`admin-sidebar ${isExpanded ? 'expanded' : ''}`}  // Correct className usage
      onMouseEnter={() => setIsExpanded(true)} // Correct typo in setIsExpanded
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-header">
        <img src={Logo} alt="Logo" className="logo-icon" />
        {isExpanded && <h2>Exdollarium</h2>} {/* Only show name when expanded */}
      </div>

      <nav className="sidebar-nav">
        <Link to="/admin">
          <FaHome className="sidebar-icon" />
          {isExpanded && <span>Dashboard</span>}
        </Link>
        <Link to="/admin/users">
          <FaUsers className="sidebar-icon" />
          {isExpanded && <span>Users</span>}
        </Link>
        <Link to="/admin/trades">
          <FaExchangeAlt className="sidebar-icon" />
          {isExpanded && <span>Trade Transactions</span>}
        </Link>
        <Link to="/admin/withdrawals">
          <FaMoneyBillWave className="sidebar-icon" />
          {isExpanded && <span>Withdrawals</span>} {/* Link to Withdrawal Requests */}
        </Link>
        <Link to="/admin/wallet">
          <FaWallet className="sidebar-icon" />
          {isExpanded && <span>Wallet</span>} {/* Link to Admin Wallet */}
        </Link>
        <Link to="/admin/services">
          <FaCogs className="sidebar-icon" />
          {isExpanded && <span>Services</span>} {/* Link to Admin Services */}
        </Link>
        <Link to="/admin/roles">
          <FaUserShield className="sidebar-icon" />
          {isExpanded && <span>Roles</span>}
        </Link>
        <Link to="/admin/audit-logs">
          <FaClipboardList className="sidebar-icon" />
          {isExpanded && <span>Audit Logs</span>}
        </Link>
        <Link to="/admin/notifications">
          <FaBell className="sidebar-icon" />
          {isExpanded && <span>Notifications</span>}
        </Link>
        <Link to="/admin/manage-contacts">
          <FaAddressBook className="sidebar-icon" />  {/* Updated to FaAddressBook */}
          {isExpanded && <span>Manage Contacts</span>}
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;
