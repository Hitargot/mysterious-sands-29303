import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert'; // Import your Alert component
import '../styles/Signup.css'; // Import your CSS file
import axios from 'axios'; // Import axios

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [alertMessage, setAlertMessage] = useState('');
  const [alertDuration, setAlertDuration] = useState(3000);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
// const apiUrl = "http://localhost:22222";

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setAlertMessage('Password must be at least 8 characters long and include letters, numbers, and symbols.');
      setAlertDuration(3000);
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      setAlertMessage('Passwords do not match.');
      setAlertDuration(3000);
      return;
    }
  
    try {
      const response = await axios.post(`${apiUrl}/api/auth/signup`, {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
  
      if (response.status !== 201) {
        setAlertMessage(response.data.message || 'Signup failed');
        setAlertDuration(3000);
        return;
      }
  
      setAlertMessage('Signup successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login'); // Redirect to login page after successful signup
      }, 3000);
    } catch (err) {
      if (err.response) {
        setAlertMessage(err.response.data.message || 'An unexpected error occurred.');
      } else {
        setAlertMessage('An unexpected error occurred.');
      }
      setAlertDuration(3000);
    }
  };
  

  return (
    <div className="signup-container">
      {/* Header Section */}
      <header className="signup-header">
        <div className="logo">
          <img src={require('../assets/images/Exodollarium-01.png')} alt="Logo" />
          <span>Exdollarium</span>
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      {/* Alert Section */}
      {alertMessage && (
        <Alert
          message={alertMessage}
          duration={alertDuration}
          onClose={() => setAlertMessage('')}
        />
      )}

      <h2>Signup</h2>
      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            name="username"
            id="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone:</label>
          <input
            type="text"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Signup</button>
      </form>

      {/* Footer Links */}
      <div className="footer-links">
        <p>Already have an account? <Link to="/login">Login here.</Link></p>
      </div>
    </div>
  );
};

export default Signup;
