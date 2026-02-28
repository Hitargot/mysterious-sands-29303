/**
 * AdminPanel.js
 *
 * Self-contained admin panel component.
 * Renders the AdminLayout (sidebar + header) and maps every admin route to
 * its corresponding page component via React Router <Routes>.
 *
 * Import and use this inside your App.js like:
 *
 *   import AdminPanel from './admin/AdminPanel';
 *
 *   // Inside <Routes>:
 *   <Route path="/admin/*" element={<PrivateRoute adminOnly={true}><AdminPanel /></PrivateRoute>} />
 *
 * This replaces the pattern of mapping `adminRoutes` individually in App.js.
 */

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Spinner from '../components/Spinner';

// ── Lazy-load all admin pages for better performance ─────────────────────────

const AdminHome            = lazy(() => import('../pages/AdminHome'));
const UsersManagement      = lazy(() => import('../pages/UsersManagement'));
const TradeTransactions    = lazy(() => import('../pages/TradeTransactions'));
const WithdrawalRequests   = lazy(() => import('../pages/WithdrawalRequests'));
const ServiceManagement    = lazy(() => import('../pages/ServiceManagement'));
const AdminWallet          = lazy(() => import('../pages/AdminWallet'));
const SecondaryAdminWallet = lazy(() => import('../pages/SecondaryAdminWallet'));
const RoleManagement       = lazy(() => import('../pages/RoleManagement'));
const NotificationsManagement = lazy(() => import('../pages/NotificationsManagement'));
const AuditLogs            = lazy(() => import('../pages/AuditLogs'));
const ManageContacts       = lazy(() => import('../pages/ManageContacts'));
const BankAccountList      = lazy(() => import('../pages/BankAccountList'));
const AdminFAQ             = lazy(() => import('../pages/AdminFAQ'));
const AdminReviewPage      = lazy(() => import('../pages/AdminReviewPage'));
const AdminChats           = lazy(() => import('../pages/AdminChats'));
const AdminTickets         = lazy(() => import('../pages/AdminTickets'));
const AdminPreSubmissions  = lazy(() => import('../pages/AdminPreSubmissions'));
const AdminFlyer           = lazy(() => import('../pages/AdminFlyer'));
const AdminKYC             = lazy(() => import('../pages/AdminKYC'));
const AdminChangePassword  = lazy(() => import('../pages/AdminChangePassword'));

// ── Loading fallback ──────────────────────────────────────────────────────────

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <Spinner />
  </div>
);

// ── AdminPanel ────────────────────────────────────────────────────────────────

/**
 * AdminPanel wraps every admin page in the shared AdminLayout and handles
 * sub-routing internally.  The parent only needs to match "/admin/*".
 */
const AdminPanel = () => {
  return (
    <AdminLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Default admin home */}
          <Route index element={<AdminHome />} />

          {/* Users */}
          <Route path="users" element={<UsersManagement />} />

          {/* Trades & Confirmations */}
          <Route path="trades" element={<TradeTransactions />} />

          {/* Pre-Submissions */}
          <Route path="pre-submissions" element={<AdminPreSubmissions />} />

          {/* Withdrawals */}
          <Route path="withdrawals" element={<WithdrawalRequests />} />

          {/* KYC Verification */}
          <Route path="kyc" element={<AdminKYC />} />

          {/* Services */}
          <Route path="services" element={<ServiceManagement />} />

          {/* Wallets */}
          <Route path="wallet" element={<AdminWallet />} />
          <Route path="secondary-admin/wallet" element={<SecondaryAdminWallet />} />

          {/* Roles & Permissions */}
          <Route path="roles" element={<RoleManagement />} />

          {/* Chats & Tickets */}
          <Route path="chats" element={<AdminChats />} />
          <Route path="tickets" element={<AdminTickets />} />

          {/* Communications */}
          <Route path="notifications" element={<NotificationsManagement />} />
          <Route path="flyer" element={<AdminFlyer />} />

          {/* Contacts & Banks */}
          <Route path="manage-contacts" element={<ManageContacts />} />
          <Route path="Banks-list" element={<BankAccountList />} />

          {/* Content */}
          <Route path="Admin-faq" element={<AdminFAQ />} />
          <Route path="Admin-reviews" element={<AdminReviewPage />} />

          {/* Audit */}
          <Route path="audit-logs" element={<AuditLogs />} />

          {/* Account */}
          <Route path="change-password" element={<AdminChangePassword />} />

          {/* Catch-all: redirect unknown admin paths to admin home */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  );
};

export default AdminPanel;
