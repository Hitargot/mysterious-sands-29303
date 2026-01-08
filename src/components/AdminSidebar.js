import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { 
  FaHome, 
  FaUsers, 
  FaComments,
  FaExchangeAlt, 
  FaMoneyBillWave, 
  FaWallet, 
  FaCogs, 
  FaUserShield, 
  FaClipboardList, 
  FaBell, 
  FaAddressBook,
  FaTicketAlt
  ,
  FaBullhorn
} from 'react-icons/fa'; // Icons for Admin Sidebar
import ResponsiveLogo from './ResponsiveLogo';
import '../styles/Sidebar.css'; // Ensure styles are correctly imported

const AdminSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasNewConfirmations, setHasNewConfirmations] = useState(false);
  const [hasNewWithdrawals, setHasNewWithdrawals] = useState(false);
  const [hasNewTickets, setHasNewTickets] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        if (!mounted) return;
        const s = res && res.data ? res.data : {};
        const confByStatus = s.confirmationsByStatus || {};
        const withdrawByStatus = s.withdrawalsByStatus || {};
        // consider these statuses as "need attention"
        const watchStatuses = ['pending', 'funding', 'processing'];
        const confPending = watchStatuses.reduce((acc, k) => acc + (Number(confByStatus[k] || 0)), 0);
        const withPending = watchStatuses.reduce((acc, k) => acc + (Number(withdrawByStatus[k] || 0)), 0);
        const ticketsCount = Number(s.ticketsCount || s.openTickets || 0);
        setHasNewConfirmations(confPending > 0);
        setHasNewWithdrawals(withPending > 0);
        setHasNewTickets(ticketsCount > 0);
      } catch (err) {
        // silent fail: admin stats may not exist on older backends
      }
    };
    load();
    const iv = setInterval(load, 30 * 1000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  return (
    <div
      className={`admin-sidebar ${isExpanded ? 'expanded' : ''}`}  // Correct className usage
      onMouseEnter={() => setIsExpanded(true)} // Correct typo in setIsExpanded
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-header">
        <ResponsiveLogo variant="small" alt="Exdollarium" className="logo-icon" />
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
          {!isExpanded && hasNewConfirmations && <span className="sidebar-dot" />}
          {isExpanded && hasNewConfirmations && <span style={{ marginLeft: 8 }} className="sidebar-dot" />}
        </Link>
        <Link to="/admin/pre-submissions">
          <FaClipboardList className="sidebar-icon" />
          {isExpanded && <span>Pre-Submissions</span>}
        </Link>
        <Link to="/admin/withdrawals">
          <FaMoneyBillWave className="sidebar-icon" />
          {isExpanded && <span>Withdrawals</span>} {/* Link to Withdrawal Requests */}
          {!isExpanded && hasNewWithdrawals && <span className="sidebar-dot" />}
          {isExpanded && hasNewWithdrawals && <span style={{ marginLeft: 8 }} className="sidebar-dot" />}
        </Link>
        <Link to="/admin/wallet">
          <FaWallet className="sidebar-icon" />
          {isExpanded && <span>Wallet</span>} {/* Link to Admin Wallet */}
        </Link>
        <Link to="/admin/chats">
          <FaComments className="sidebar-icon" />
          {isExpanded && <span>Chats</span>}
        </Link>
        <Link to="/admin/tickets">
          <FaTicketAlt className="sidebar-icon" />
          {isExpanded && <span>Tickets</span>}
          {!isExpanded && hasNewTickets && <span className="sidebar-dot" />}
          {isExpanded && hasNewTickets && <span style={{ marginLeft: 8 }} className="sidebar-dot" />}
        </Link>
        <Link to="/admin/secondary-admin/wallet">
          <FaWallet className="sidebar-icon" />
          {isExpanded && <span>Withdrawal Wallet</span>} {/* Link to Admin Wallet */}
        </Link>
        <Link to="/admin/services">
          <FaCogs className="sidebar-icon" />
          {isExpanded && <span>Services</span>} {/* Link to Admin Services */}
        </Link>
        <Link to="/admin/roles">
          <FaUserShield className="sidebar-icon" />
          {isExpanded && <span>Roles</span>}
        </Link>
        <Link to="/admin/banks-list">
          <FaAddressBook className="sidebar-icon" />  {/* Updated to FaAddressBook */}
          {isExpanded && <span>Bank Accounts list</span>}
        </Link>
        <Link to="/admin/audit-logs">
          <FaClipboardList className="sidebar-icon" />
          {isExpanded && <span>Audit Logs</span>}
        </Link>
        <Link to="/admin/notifications">
          <FaBell className="sidebar-icon" />
          {isExpanded && <span>Notifications</span>}
        </Link>
        <Link to="/admin/flyer">
          <FaBullhorn className="sidebar-icon" />
          {isExpanded && <span>Flyer</span>}
        </Link>
        <Link to="/admin/manage-contacts">
          <FaAddressBook className="sidebar-icon" />  {/* Updated to FaAddressBook */}
          {isExpanded && <span>Manage Contacts</span>}
        </Link>
        <Link to="/admin/Admin-faq">
          <FaAddressBook className="sidebar-icon" />  {/* Updated to FaAddressBook */}
          {isExpanded && <span>Admin Faq</span>}
        </Link>
        <Link to="/admin/Admin-reviews">
          <FaAddressBook className="sidebar-icon" />  {/* Updated to FaAddressBook */}
          {isExpanded && <span>Admin Reviews</span>}
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;
