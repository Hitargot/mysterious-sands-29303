import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ResponsiveLogo from './ResponsiveLogo';
import Alert from '../components/Alert';

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleResend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ message: '', type: '' });
  
    try {
      const response = await axios.post(`${apiUrl}/api/auth/resend-verification`, { email });
  
      // Success response handling
      setAlert({ message: response.data.message, type: 'success' });
  
      // Clear the email input field
      setEmail('');  // Assuming `email` is the state variable holding the input value
    } catch (error) {
      // Error response handling
      setAlert({ message: error.response?.data?.message || 'Failed to resend verification email.', type: 'error' });
    }
  
    setLoading(false);
  };
 

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#d0e6fd' }}>
      <div style={{ maxWidth: '400px', padding: '25px', backgroundColor: '#162660', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', textAlign: 'center' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#f1e4d1', fontWeight: 'bold' }}>
            <ResponsiveLogo alt="Exdollarium" style={{ marginRight: '10px' }} />
            <span>Exdollarium</span>
          </div>
          <nav>
            <Link to="/" style={{ marginLeft: '15px', textDecoration: 'none', color: '#d0e6fd', transition: 'color 0.3s ease-in-out' }}>Home</Link>
            <Link to="/signup" style={{ marginLeft: '15px', textDecoration: 'none', color: '#d0e6fd', transition: 'color 0.3s ease-in-out' }}>Signup</Link>
          </nav>
        </header>

        {/* Title */}
        <h2 style={{ color: '#f1e4d1', marginBottom: '15px' }}>Resend Verification Email</h2>
        <p style={{ color: '#d0e6fd', marginBottom: '15px' }}>Enter your email to receive a new verification link.</p>

        {/* Alert Message */}
        {alert.message && <Alert message={alert.message} type={alert.type} />}

        {/* Form */}
        <form onSubmit={handleResend}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '10px',
              width: '100%',
              marginBottom: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              outline: 'none'
            }}
          />
          <br />
          <button type="submit" disabled={loading} style={{
            backgroundColor: loading ? '#b5b5b5' : '#d0e6fd',
            color: '#162660',
            padding: '10px',
            width: '100%',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Sending...' : 'Resend Email'}
          </button>
        </form>

        {/* Back to Login */}
        <p style={{ marginTop: '15px', color: '#f1e4d1' }}>
          Already verified? <Link to="/login" style={{ color: '#d0e6fd', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResendVerification;
