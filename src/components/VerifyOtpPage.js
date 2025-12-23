import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import ResponsiveLogo from './ResponsiveLogo';
import Alert from '../components/Alert';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [otpValid, setOtpValid] = useState(false);
  const location = useLocation();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const otpFromUrl = urlParams.get('otp'); // Retrieve OTP from URL

    if (otpFromUrl) {
      setOtp(otpFromUrl); // Pre-fill OTP if available in the URL
    }
  }, [location]);

  // Check if OTP is a 4-digit number
  useEffect(() => {
    if (otp.length === 4 && /^[0-9]{4}$/.test(otp)) {
      setOtpValid(true); // OTP is valid if it's a 4-digit number
    } else {
      setOtpValid(false); // OTP is invalid otherwise
    }
  }, [otp]);

  const handleVerifyOtp = async () => {
    setLoading(true);
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

    if (!token) {
      setAlert({ message: 'No token found. Please log in again.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const { id: userId } = jwtDecode(token);
      const response = await axios.get(`${apiUrl}/api/users/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const email = response.data.email;

      // Verify OTP on the backend
      await axios.post(`${apiUrl}/api/user/verify-otp-for-pin-reset`, { email, otp });

      setAlert({ message: 'OTP verified!', type: 'success' });
      setTimeout(() => navigate('/reset-pin', { state: { otp } }), 2000); // Pass OTP via state
    } catch (err) {
      setAlert({
        message: err.response?.data?.message || 'OTP verification failed.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#d0e6fd' }}>
      <div
        style={{
          maxWidth: '400px',
          padding: '25px',
          backgroundColor: '#162660',
          borderRadius: '10px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#f1e4d1', fontWeight: 'bold' }}>
            <ResponsiveLogo alt="Exdollarium" style={{ marginRight: '10px' }} />
            <span>Exdollarium</span>
          </div>
        </header>

        <h2 style={{ color: '#f1e4d1', marginBottom: '15px' }}>Verify OTP</h2>

        {alert.message && <Alert message={alert.message} type={alert.type} />}

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '15px',
            borderRadius: '5px',
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            backgroundColor: '#f1e4d1',
          }}
        />

        <button
          onClick={handleVerifyOtp}
          disabled={loading || !otpValid}
          style={{
            backgroundColor: loading ? '#b5b5b5' : '#d0e6fd',
            color: '#162660',
            padding: '12px',
            borderRadius: '5px',
            fontWeight: 'bold',
            width: '100%',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
