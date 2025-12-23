import React from 'react';
import { Link } from 'react-router-dom';

// Central source of truth for dashboard navigation
export const menuItems = [
  { label: 'Trades', to: '/dashboard/trades', component: 'trades' },
  { label: 'Wallet Funding', to: '/dashboard/wallet-funding', component: 'wallet-funding' },
  { label: 'Users', to: '/dashboard/users', component: 'users' },
  { label: 'Withdrawals', to: '/dashboard/withdrawals', component: 'withdrawals' },
  { label: 'Profile', to: '/dashboard/profile', component: 'profile' },
  { label: 'Create Pre-submission', to: '/pre-submission', component: 'create-presubmission' },
  { label: 'My Pre-submissions', to: '/my-pre-submissions', component: 'my-pre-submissions' },
  { label: 'Logout', to: '/login', component: 'logout' },
];

export const NavList = ({ className }) => (
  <nav className={className}>
    <ul>
      {menuItems.map((m) => (
        <li key={m.label}>
          <Link to={m.to}>{m.label}</Link>
        </li>
      ))}
    </ul>
  </nav>
);

export default NavList;
