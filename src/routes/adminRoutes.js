// src/routes/adminRoutes.js
import AdminHome from '../pages/AdminHome';
import UsersManagement from '../pages/UsersManagement';
import TradeTransactions from '../pages/TradeTransactions';
import WithdrawalRequests from '../pages/WithdrawalRequests';
import ServiceManagement from '../pages/ServiceManagement';
import AdminWallet from '../pages/AdminWallet';
import RoleManagement from '../pages/RoleManagement';
import NotificationsManagement from '../pages/NotificationsManagement';
import AuditLogs from '../pages/AuditLogs';
import ManageContacts from '../pages/ManageContacts';
import  BankAccountList from '../pages/BankAccountList';
import AdminFAQ from '../pages/AdminFAQ';
import AdminReviewPage from '../pages/AdminReviewPage';


const adminRoutes = [
  { path: '/admin', component: AdminHome},
  { path: '/admin/users', component: UsersManagement},
  { path: '/admin/trades', component: TradeTransactions, permissions: ['view_trades'] },
  { path: '/admin/withdrawals', component: WithdrawalRequests, permissions: ['view_withdrawals', 'approve_withdrawals'] },
  { path: '/admin/services', component: ServiceManagement, permissions: ['manage_services'] },
  { path: '/admin/wallet', component: AdminWallet, permissions: ['view_wallet'] },
  { path: '/admin/roles', component: RoleManagement, permissions: ['manage_roles'] },
  { path: '/admin/notifications', component: NotificationsManagement, permissions: ['view_notifications'] },
  { path: '/admin/audit-logs', component: AuditLogs, permissions: ['view_audit_logs'] },
  { path: '/admin/manage-contacts', component: ManageContacts, permissions: ['manage_contacts'] },
  { path: '/admin/Banks-list', component: BankAccountList, permissions: ['manage_contacts'] },
  { path: '/admin/Admin-faq', component:AdminFAQ, permissions: ['manage_contacts'] },
  { path: '/admin/Admin-reviews', component:AdminReviewPage, permissions: ['manage_contacts'] },

];

export default adminRoutes;
