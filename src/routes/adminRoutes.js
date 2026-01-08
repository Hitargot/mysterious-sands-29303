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
import SecondaryAdminWallet from '../pages/SecondaryAdminWallet';
import AdminChats from '../pages/AdminChats';
import AdminTickets from '../pages/AdminTickets';
import AdminPreSubmissions from '../pages/AdminPreSubmissions';
import AdminFlyer from '../pages/AdminFlyer';


const adminRoutes = [
  { path: '/admin', component: AdminHome},
  { path: '/admin/users', component: UsersManagement},
  { path: '/admin/trades', component: TradeTransactions, permissions: ['view_trades'] },
  { path: '/admin/withdrawals', component: WithdrawalRequests, permissions: ['view_withdrawals', 'approve_withdrawals'] },
  { path: '/admin/services', component: ServiceManagement, permissions: ['manage_services'] },
  { path: '/admin/wallet', component: AdminWallet, permissions: ['view_wallet'] },
  { path: '/admin/secondary-admin/wallet', component: SecondaryAdminWallet, permissions: ['view_wallet'] },
  { path: '/admin/roles', component: RoleManagement, permissions: ['manage_roles'] },
  { path: '/admin/notifications', component: NotificationsManagement, permissions: ['view_notifications'] },
  { path: '/admin/audit-logs', component: AuditLogs, permissions: ['view_audit_logs'] },
  { path: '/admin/manage-contacts', component: ManageContacts, permissions: ['manage_contacts'] },
  { path: '/admin/Banks-list', component: BankAccountList, permissions: ['manage_contacts'] },
  { path: '/admin/Admin-faq', component:AdminFAQ, permissions: ['manage_contacts'] },
  { path: '/admin/Admin-reviews', component:AdminReviewPage, permissions: ['manage_contacts'] },
  { path: '/admin/chats', component: AdminChats, permissions: ['view_chats'] },
  { path: '/admin/tickets', component: AdminTickets, permissions: ['view_chats'] },
  { path: '/admin/pre-submissions', component: AdminPreSubmissions, permissions: ['view_pre_submissions'] },
  { path: '/admin/flyer', component: AdminFlyer, permissions: ['manage_content'] },

];

export default adminRoutes;
