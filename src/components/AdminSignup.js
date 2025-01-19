import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert'; // Import the Alert component

const AdminSignup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(''); // Real email
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [nextMessage, setNextMessage] = useState(null); // For the next alert message after expiration
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call API with fullName, email, and phone
      const res = await axios.post(`${apiUrl}/api/admin/signup`, {
        fullName,
        email,
        phone,
      });

      // Success handling
      setMessage(res.data.message);
      setMessageType('success');
      setTimeout(() => {
        // Set next message after success alert expires
        setNextMessage({ message: 'Now you can log in with your credentials!', type: 'info' });
        navigate('/admin/login');
      }, 3000); // Wait for 3 seconds before showing next message
    } catch (err) {
      // Error handling
      setMessage(err.response?.data?.message || 'An error occurred. Please try again.');
      setMessageType('error');
    }
  };

  useEffect(() => {
    // Set a new alert after the first one expires
    if (message && nextMessage) {
      const timer = setTimeout(() => {
        setMessage(nextMessage.message);
        setMessageType(nextMessage.type);
      }, 5000); // Wait for 5 seconds before showing the next message
      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [message, nextMessage]);

  return (
    <div>
      <h2>Create Admin Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Real Email (where you want login details)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Admin</button>
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
          Already have an account? <a href="/admin/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;
