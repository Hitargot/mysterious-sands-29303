import React, { useState } from 'react';
import axios from 'axios';
import Alert from './Alert'; // Assuming you have this alert component
import '../styles/ForgotPassword.css'; // Import your custom styles
import { Link } from 'react-router-dom'; // Import Link for routing

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  //const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  const apiUrl = "http://localhost:22222";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await axios.post(`${apiUrl}/api/auth/forgot-password`, { email });
      setAlert({ type: 'success', message: response.data.message });
      setEmail(''); // Clear the input field

      // Reset alert after 3 seconds
      setTimeout(() => {
        setAlert({ type: '', message: '' }); // Clear alert
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong';
      setAlert({ type: 'error', message: errorMsg });

      // Reset alert after 3 seconds
      setTimeout(() => {
        setAlert({ type: '', message: '' }); // Clear alert
      }, 3000);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <header className="login-header">
          <div className="logo">
            <img src={require('../assets/images/Exodollarium-01.png')} alt="Exdollarium logo" /> {/* Adjust path accordingly */}
            <span>EXDOLLARIUM</span>
          </div>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
          </nav>
        </header>

        <h2>Forgot Password</h2>

        {/* Alert Component */}
        {alert.message && <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <footer className="footer-links">
          <p>Already have an account? <Link to="/login">Login</Link></p>
          <p>Don't have an account? <Link to="/signup">Signup here</Link></p>
        </footer>
      </div>
    </div>
  );
};

export default ForgotPassword;
