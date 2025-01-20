import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert'; // Import your Alert component
import '../styles/Login.css'; // Import your CSS file
import axios from 'axios'; // Import axios
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode

const Login = ({ setUserRole }) => { // Accept setUserRole as a prop
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: '',
  });
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const response = await axios.post(`${apiUrl}/api/auth/login`, {
              usernameOrEmailOrPhone,
              password,
          });
      // Check for success response
      if (response.status === 200) {
        setAlertMessage('Login successful! Redirecting to dashboard...');

          // Decode the JWT token
          const token = response.data.token;
          const decodedToken = jwtDecode(token);
          const userName = decodedToken.username; // Assuming 'username' is in the decoded token payload


          // Extract user role and user ID from the decoded token
          const role = decodedToken.role; // Assuming 'role' is in token payload
          // const userId = decodedToken.id; // Assuming 'id' or similar identifier is in token payload

          // Set the user role based on decoded token data
          setUserRole(role); // Update the user role in the App

          // Store the token in local storage (or in context if preferred)
          localStorage.setItem('jwtToken', response.data.token);
          localStorage.setItem('username', userName);
          console.log(response.data); // Check if 'username' is part of the response




        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (err) {
      // Handle errors
      if (err.response) {
        setAlertMessage(err.response.data.message || 'Login failed');
      } else {
        setAlertMessage('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        {/* Header Section */}
        <header className="login-header">
          <div className="logo">
            <img src={require('../assets/images/Exodollarium-01.png')} alt="Logo" />
            <span>Exdollarium</span>
          </div>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/signup">Signup</Link>
          </nav>
        </header>

        {/* Alert Section */}
        {alertMessage && (
          <Alert
            message={alertMessage}
            onClose={() => setAlertMessage('')}
          />
        )}

        <h2>Login</h2>
        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier">Username/Email/Phone:</label>
            <input
              type="text"
              name="identifier"
              id="identifier"
              value={credentials.identifier}
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
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>

        {/* Footer Links */}
        <div className="footer-links">
          <p>Don't have an account? <Link to="/signup">Signup here.</Link></p>
          <p><Link to="/forgot-password">Forgot Password?</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
