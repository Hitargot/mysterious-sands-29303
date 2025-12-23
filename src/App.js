import React, { useState, useEffect } from 'react';
import { requestPermissionAndGetToken, onMessageListener } from './firebase';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from './config/api';
import Login from './components/Login';
import Signup from './components/Signup';
import UserDashboard from './dashboards/UserDashboard'; // User Dashboard
import AdminDashboard from './dashboards/AdminDashboard'; // Admin Dashboard
import Home from './Home/Home';
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
// Chatbot temporarily removed
import ReviewForm from './components/ReviewForm';
import VerifyOtpPage from "./components/VerifyOtpPage";
import ResetPinPage from "./components/ResetPinPage";
import TermsAndConditions from './components/TermsAndConditions';
import RequestOtpPage from './components/RequestOtpPage';
import SetWithdrawPin from './components/SetWithdrawPin';
import PayPalFeeCalculator from './components/paypalCalculator';
import TransferPage from './components/TransferPage';


const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    // Request permission and get the FCM token
    requestPermissionAndGetToken().then((token) => {
      if (token) {
        // Send the token to the backend for storage (use configured API_BASE)
        const saveTokenUrl = API_BASE ? `${API_BASE}/api/notifications/save-token` : '/api/notifications/save-token';
        axios.post(saveTokenUrl, { token })
          .then((response) => {
            console.log("Token sent to backend successfully:", response);
          })
          .catch((error) => {
            console.error("Error sending token to backend:", error);
          });
      }
    });

    // Listen for incoming push notifications
    onMessageListener().then((payload) => {
      console.log("Push received:", payload);
      // Show toast or in-app alert
      // Example: Toast notification
      alert(`New notification: ${payload.notification.body}`);
    });

    // Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js', { type: 'module' })
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function(error) {
      console.error('Service Worker registration failed:', error);
    });
}

  }, []);
  

  

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
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/TradeCalculator" element={<PrivateRoute><TradeCalculator /></PrivateRoute>} />
          <Route path="/WalletPage" element={<PrivateRoute><WalletPage /></PrivateRoute>} />
          <Route path="/overview" element={<PrivateRoute><Overview walletBalance={walletBalance} setWalletBalance={setWalletBalance} /></PrivateRoute>} />
          <Route path="/Notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/role/login" element={<RoleLogin />} />
          <Route path="/role/no-access" element={<NoAccess />} />
          <Route path="/trade-history" element={<PrivateRoute><TradeHistory /></PrivateRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          {/* Chatbot route disabled temporarily */}
          <Route path="/reviews/submit" element={<ReviewForm />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/set-pin" element={<SetWithdrawPin />} />
          <Route path="/request-otp" element={<RequestOtpPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/reset-pin" element={<ResetPinPage />} />
          <Route path="/paypal-fee-calculator" element={<PayPalFeeCalculator />} />
          <Route path="/transfer" element={<PrivateRoute><TransferPage /></PrivateRoute>} />
          <Route path="/pre-submission" element={<PrivateRoute><Navigate to="/dashboard?panel=create-presubmission" replace /></PrivateRoute>} />
          <Route path="/my-pre-submissions" element={<PrivateRoute><Navigate to="/dashboard?panel=my-pre-submissions" replace /></PrivateRoute>} />
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly={true}>
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
                <PrivateRoute adminOnly={true}>
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
          <Route path="/dashboard/*" element={<PrivateRoute>{userRole === 'admin' ? <AdminDashboard /> : <UserDashboard />}</PrivateRoute>} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
};

export default App;
