import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/Exodollarium-01.png'; // Make sure the logo path is correct
import Alert from '../components/Alert';

const SetWithdrawPin = () => {
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const navigate = useNavigate();
  
  // Get JWT token from storage
  const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
  
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSetPin = async () => {
    if (!token) {
      setAlert({ message: "You must be logged in to set a withdrawal PIN.", type: "error" });
      return;
    }

    if (newPin.length !== 4 || isNaN(newPin)) {
      setAlert({ message: "PIN must be a 4-digit number.", type: "error" });
      return;
    }

    if (newPin !== confirmNewPin) {
      setAlert({ message: "PINs do not match.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/user/set-pin`,  // Ensure this route is implemented in the backend
        { newPin },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAlert({ message: response.data.message || "PIN set successfully!", type: "success" });
      setNewPin("");
      setConfirmNewPin("");

      // Optionally, redirect after success
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setAlert({ message: error.response?.data?.message || "Error setting PIN.", type: "error" });
    }
    setLoading(false);
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

        <h2 style={{ color: '#f1e4d1', marginBottom: '15px' }}>Set Withdrawal PIN</h2>

        {alert.message && <Alert message={alert.message} type={alert.type} />}

        <label style={{ display: 'block', color: '#f1e4d1', marginBottom: '5px' }}>New Withdrawal PIN:</label>
        <input
          type="password"
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
          maxLength="4"
          placeholder="Enter new 4-digit PIN"
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

        <label style={{ display: 'block', color: '#f1e4d1', marginBottom: '5px' }}>Confirm New PIN:</label>
        <input
          type="password"
          value={confirmNewPin}
          onChange={(e) => setConfirmNewPin(e.target.value)}
          maxLength="4"
          placeholder="Confirm new PIN"
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '5px',
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            backgroundColor: '#f1e4d1',
          }}
        />

        <button
          onClick={handleSetPin}
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
          {loading ? 'Processing...' : 'Set PIN'}
        </button>
      </div>
    </div>
  );
};

export default SetWithdrawPin;
