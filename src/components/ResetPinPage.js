import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import logo from '../assets/images/Exodollarium-01.png';
import Alert from '../components/Alert';

//const apiUrl = 'http://localhost:22222'; // Your API URL
const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";

const ResetPinPage = () => {
  const [newPin, setNewPin] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();
  const otp = state?.otp;
  const navigate = useNavigate();

  const handleResetPin = async () => {
    if (!otp) return alert('OTP is missing.');

    setLoading(true);
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

    if (!token) {
      alert('Token is missing. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const { id: userId } = decoded;

      const response = await axios.get(`${apiUrl}/api/users/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const email = response.data.email;

      await axios.post(
        `${apiUrl}/api/user/reset-pin`,
        { email, otp, newPin },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setAlert({ message: 'PIN reset successfully!', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setAlert({
        message: err.response?.data?.message || 'PIN reset failed.',
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
            <img src={logo} alt="Logo" style={{ height: '30px', marginRight: '10px' }} />
            <span>Exdollarium</span>
          </div>
        </header>

        <h2 style={{ color: '#f1e4d1', marginBottom: '15px' }}>Set New Withdrawal PIN</h2>

        {alert.message && <Alert message={alert.message} type={alert.type} />}

        <input
          type="password"
          maxLength={4}
          placeholder="Enter 4-digit new PIN"
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
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
          onClick={handleResetPin}
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
          {loading ? 'Resetting...' : 'Reset PIN'}
        </button>
      </div>
    </div>
  );
};

export default ResetPinPage;
