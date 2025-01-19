import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <nav>
          <ul>
            <li><Link to="/dashboard/trades">Trades</Link></li>
            <li><Link to="/dashboard/wallet-funding">Wallet Funding</Link></li>
            <li><Link to="/dashboard/users">Users</Link></li>
            <li><Link to="/dashboard/withdrawals">Withdrawals</Link></li>
            <li><Link to="/dashboard/profile">Profile</Link></li>
            <li><Link to="/login">Logout</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="content">
        <Outlet /> {/* This will render child routes */}
      </main>
    </div>
  );
};

export default AdminDashboard;
