import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import UserDashboard from './dashboards/UserDashboard'; // User Dashboard
import AdminDashboard from './dashboards/AdminDashboard'; // Admin Dashboard
import Home from './pages/Home';
import Testimonials from './pages/Testimonials';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import Profile from './components/Profile';
import TradeCalculator from './components/TradeCalculator';
import { NotificationProvider } from './context/NotificationContext';
import Notifications from './components/Notifications';
import WalletPage from './components/WalletPage';
import Overview from './components/Overview';
import adminRoutes from './routes/adminRoutes'; // Import adminRoutes
import AdminLayout from './layouts/AdminLayout'; // Layout for admin pages
import PrivateRoute from './components/PrivateRoute'; // PrivateRoute component
import AdminSignup from './components/AdminSignup'; // Import the AdminSignup component
import VerifyAccount from './components/VerifyAccount';
import VerifyRole from './components/VerifyRole';
import AdminLogin from './components/AdminLogin';
import AdminForgotPassword from './components/AdminForgotPassword';
import AdminHome from './pages/AdminHome';
import RoleLogin from './components/RoleLogin';
import NoAccess from './components/NoAccess';
import TradeHistory from './components/TradeHistory';
import VerifyEmail from './components/VerifyEmail';
import ResendVerification from './components/ResendVerification';
import Chatbot from './components/Chatbot';


const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/login" element={<Login setUserRole={setUserRole} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin/verify" element={<VerifyAccount />} />
          <Route path="/roles/verify" element={<VerifyRole />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/TradeCalculator" element={<TradeCalculator />} />
          <Route path="/WalletPage" element={<WalletPage />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/overview" element={<Overview walletBalance={walletBalance} setWalletBalance={setWalletBalance} />} />
          <Route path="/Notifications" element={<Notifications />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/role/login" element={<RoleLogin />} />
          <Route path="/role/no-access" element={<NoAccess/>} />
          <Route path="/trade-history" element={<TradeHistory/>} />
          <Route path="/verify-email" element={<VerifyEmail/>} />
          <Route path="/resend-verification" element={<ResendVerification/>} />
          <Route path="/chat-bot" element={<Chatbot/>} />

          <Route
            path="/admin"
            element={
              <PrivateRoute >
                <AdminLayout>
                  <AdminHome />
                </AdminLayout>
              </PrivateRoute>
            }
          />
          {adminRoutes.map(({ path, component }, index) => (
            <Route
              key={index}
              path={path}
              element={
                <PrivateRoute>
                  <AdminLayout>
                    {React.createElement(component)}
                  </AdminLayout>
                </PrivateRoute>
              }
            />
          ))}
         
          {/* Redirect for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />

          {/* Role-based dashboard routing */}
          <Route path="/dashboard" element={userRole === 'admin' ? <AdminDashboard /> : <UserDashboard />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
};

export default App;
