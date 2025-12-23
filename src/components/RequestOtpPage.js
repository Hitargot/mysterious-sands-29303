import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import ResponsiveLogo from './ResponsiveLogo';
import Alert from '../components/Alert';

// const apiUrl = 'http://localhost:22222';
// const apiUrl = "https://exdollarium-6f0f5aab6a7d.herokuapp.com";
const apiUrl = process.env.REACT_APP_API_URL;


const RequestOtpPage = () => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const handleRequestOtp = async () => {
    setLoading(true);
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

    if (!token) return alert('You must be logged in.');

    try {
      const { id: userId } = jwtDecode(token);
      const response = await axios.get(`${apiUrl}/api/users/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const email = response.data.email;

      await axios.post(`${apiUrl}/api/user/send-otp-for-pin-reset`, { email });
      setAlert({ message: 'OTP sent to your email.', type: 'success' });
      setTimeout(() => navigate('/verify-otp'), 2000);
    } catch (err) {
      setAlert({ message: err.response?.data?.message || 'Failed to send OTP.', type: 'error' });
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

        <h2 style={{ color: '#f1e4d1', marginBottom: '15px' }}>Reset Withdrawal PIN</h2>

        {alert.message && <Alert message={alert.message} type={alert.type} />}

        <button
          onClick={handleRequestOtp}
          disabled={loading}
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
          {loading ? 'Sending OTP...' : 'Send OTP to Email'}
        </button>
      </div>
    </div>
  );
};

export default RequestOtpPage;
