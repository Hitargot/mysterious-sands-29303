import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/Exodollarium-01.png';
import Alert from '../components/Alert';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(true); // ✅ Loading state added
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const navigate = useNavigate();
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com" || "http://localhost:22222";

  useEffect(() => {
    if (!token) {
      setAlert({ message: 'Invalid verification link.', type: 'error' });
      setLoading(false); // ✅ Stop loading if the token is invalid
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.get(`${apiUrl}/api/auth/verify-email?token=${token}`);
        setAlert({ message: 'Email verified successfully! Redirecting to login...', type: 'success' });

        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setAlert({ message: error.response?.data?.message || 'Email verification failed.', type: 'error' });
      }
      setLoading(false); // ✅ Stop loading after request completes
    };

    verifyEmail();
  }, [token, navigate, apiUrl]);

  // Resend Verification Email
  const handleResendVerification = async () => {
    setIsResendDisabled(true);

    try {
      const email = searchParams.get('email');
      if (!email) {
        setAlert({ message: 'Email not provided. Please sign up again.', type: 'error' });
        setIsResendDisabled(false);
        return;
      }

      await axios.post(`${apiUrl}/api/auth/resend-verification`, { email });

      setAlert({ message: 'Verification email resent. Check your inbox.', type: 'success' });

      setTimeout(() => setIsResendDisabled(false), 30000);
    } catch (error) {
      setAlert({ message: error.response?.data?.message || 'Failed to resend email.', type: 'error' });
      setIsResendDisabled(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#d0e6fd' }}>
      <div style={{ maxWidth: '400px', padding: '25px', backgroundColor: '#162660', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', textAlign: 'center' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#f1e4d1', fontWeight: 'bold' }}>
            <img src={logo} alt="Logo" style={{ height: '30px', marginRight: '10px' }} />
            <span>Exdollarium</span>
          </div>
          <nav>
            <Link to="/" style={{ marginLeft: '15px', textDecoration: 'none', color: '#d0e6fd', transition: 'color 0.3s ease-in-out' }}>Home</Link>
            <Link to="/signup" style={{ marginLeft: '15px', textDecoration: 'none', color: '#d0e6fd', transition: 'color 0.3s ease-in-out' }}>Signup</Link>
          </nav>
        </header>

        <h2 style={{ color: '#f1e4d1', marginBottom: '15px' }}>Email Verification</h2>

        {alert.message && <Alert message={alert.message} type={alert.type} />}

        {loading ? (
          <p style={{ color: '#d0e6fd', fontWeight: 'bold' }}>Verifying email...</p> // ✅ Show loading message
        ) : alert.type === 'success' ? (
          <Link to="/login" style={{ backgroundColor: '#d0e6fd', color: '#162660', padding: '10px', borderRadius: '5px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', marginTop: '10px' }}>
            Go to Login
          </Link>
        ) : (
          <button onClick={handleResendVerification} disabled={isResendDisabled} style={{ backgroundColor: isResendDisabled ? '#b5b5b5' : '#d0e6fd', color: '#162660', padding: '10px', borderRadius: '5px', fontWeight: 'bold', cursor: isResendDisabled ? 'not-allowed' : 'pointer' }}>
            {isResendDisabled ? 'Resend in 30s' : 'Resend Verification Email'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
