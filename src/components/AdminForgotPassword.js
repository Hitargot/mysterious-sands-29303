import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert'; // Import the Alert component

const AdminForgotPassword = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear any previous message

    try {
      // Send a request to reset password (admin-specific)
      const response = await axios.post(`${apiUrl}/api/admin/forgot-password`, {
        emailOrUsername, // Admin will provide either username or email
      });

      if (response.status === 200) {
        setMessage(response.data.message); // Success message from backend
        setMessageType('success');
        setTimeout(() => navigate('/admin/login'), 3000); // Redirect after success
      } else {
        setMessage(response.data.message || 'An error occurred. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error during forgot password request:', error);
      setMessage('An unexpected error occurred.');
      setMessageType('error');
    }
  };

  return (
    <div>
      <h2>Admin Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email or Username</label>
          <input
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="Enter your email or username"
            required
          />
        </div>
        <button type="submit">Send Reset Link</button>
      </form>

      {/* Alert Section */}
      {message && (
        <Alert
          message={message}
          type={messageType} // Pass message type to Alert for styling
          onClose={() => setMessage('')} // Optionally close the alert
        />
      )}

      <div>
        <p>
          Remembered your password? <a href="/admin/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
