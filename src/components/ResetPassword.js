import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert'; // Ensure the path is correct
import '../styles/ResetPassword.css'; // Ensure the path is correct

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if passwords match
    if (password !== confirmPassword) {
      setAlert({ message: "Passwords don't match.", type: 'error' });
      return;
    }
  
    try {
      await axios.post(`https://mysterious-sands-29303-c1f04c424030.herokuapp.com/api/auth/reset-password/${token}`, { password });
  
      // Show success alert
      setAlert({ message: 'Password reset successful! Redirecting to login...', type: 'success' });
  
      // Clear the password fields
      setPassword('');
      setConfirmPassword('');
  
      // Delay navigation to login for 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Something went wrong';
  
      if (errorMessage.includes('invalid') || errorMessage.includes('expired')) {
        setAlert({ message: 'Invalid or expired token. Please try again.', type: 'error' });
      } else {
        setAlert({ message: errorMessage, type: 'error' });
      }
  
      // Clear the password fields on error
      setPassword('');
      setConfirmPassword('');
    }
  };
  

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setAlert({ message: '', type: '' }); // Clear the alert on input change
  };

  return (
    <div className="reset-password">
      <div className="reset-password-container">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={handleInputChange(setPassword)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={handleInputChange(setConfirmPassword)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
        {alert.message && <Alert message={alert.message} type={alert.type} />}
      </div>
    </div>
  );
};

export default ResetPassword;
