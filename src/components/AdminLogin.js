import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import Alert from './Alert';

const AdminLogin = () => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [tempPasswordExpiry, setTempPasswordExpiry] = useState(null);
  const navigate = useNavigate();

  // Check token validity on component mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const { exp } = jwtDecode(token);
        if (Date.now() < exp * 1000) {
          navigate('/admin');
        } else {
          localStorage.removeItem('adminToken');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('adminToken');
      }
    }
  }, [navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('https://mysterious-sands-29303-c1f04c424030.herokuapp.com/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail: credential,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token, tempPasswordExpiresAt } = data;

        localStorage.setItem('adminToken', token);
        setMessage('Login successful!');
        setMessageType('success');

        if (tempPasswordExpiresAt) {
          setTempPasswordExpiry(new Date(tempPasswordExpiresAt).getTime());
        }
      } else {
        setMessage(data.message || 'Invalid credentials, please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An unexpected error occurred.');
      setMessageType('error');
    }
  };

  // Handle temp password expiry
  useEffect(() => {
    if (tempPasswordExpiry) {
      const checkExpiry = () => {
        const now = Date.now();
        const timeLeft = tempPasswordExpiry - now;

        if (timeLeft <= 0) {
          setMessage('Your temporary password has expired. Please reset your password.');
          setMessageType('error');
          setTempPasswordExpiry(null);
        } else {
          const minutesLeft = Math.ceil(timeLeft / 60000);
          setMessage(`Your temporary password will expire in ${minutesLeft} minute(s).`);
          setMessageType('warning');
        }
      };

      checkExpiry();
      const interval = setInterval(checkExpiry, 30000);

      return () => clearInterval(interval);
    }
  }, [tempPasswordExpiry]);

  // Redirect after successful login
  useEffect(() => {
    if (messageType === 'success') {
      const timer = setTimeout(() => {
        navigate('/admin');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [messageType, navigate]);

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email or Username</label>
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            placeholder="Enter email or username"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {message && <Alert message={message} type={messageType} onClose={() => setMessage('')} />}

      <div className="helper-links">
        <p>
          Forgot your password? <a href="/admin/forgot-password">Reset it here</a>
        </p>
        <p>
          Don’t have an account? <a href="/admin/signup">Create one</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
