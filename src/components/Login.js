import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Login = ({ setUserRole }) => {
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [alertMessage, setAlertMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false); // ✅ Fix hover state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  //const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  const apiUrl = "http://localhost:22222";

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/auth/login`, credentials);
      if (response.status === 200) {
        setAlertMessage('Login successful! Redirecting...');
        const token = response.data.token;
        const decodedToken = jwtDecode(token);
  
        setUserRole(decodedToken.role);
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('username', decodedToken.username);
        localStorage.removeItem('activeComponent');
  
        // ✅ Get redirect path or fallback to dashboard
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        sessionStorage.removeItem("redirectAfterLogin"); // ✅ Remove after using
  
        setTimeout(() => {
          navigate(redirectPath || "/dashboard");
        }, 3000);
      }
    } catch (err) {
      setAlertMessage(err.response?.data?.message || 'Login failed');
    }
  };
  
  
  return (
    <div style={styles.login}>
      <div style={styles.loginContainer}>
        <header style={styles.loginHeader}>
          <div style={styles.logo}>
            <img src={require('../assets/images/Exodollarium-01.png')} alt="Logo" style={styles.logoImg} />
            <span>Exdollarium</span>
          </div>
          <nav>
            <Link to="/" style={styles.navLink}>Home</Link>
            <Link to="/signup" style={styles.navLink}>Signup</Link>
          </nav>
        </header>

        {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage('')} />}

        <h2 style={styles.heading}>Login</h2>
        <form onSubmit={handleSubmit} style={styles.loginForm}>
          <div style={styles.formGroup}>
            <label htmlFor="identifier" style={styles.label}>Username/Email/Phone:</label>
            <input type="text" name="identifier" id="identifier" value={credentials.identifier} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password:</label>
            <input type="password" name="password" id="password" value={credentials.password} onChange={handleChange} required style={styles.input} />
          </div>
          <button
            type="submit"
            style={isHovered ? { ...styles.button, backgroundColor: '#d0e6fd' } : styles.button}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Login
          </button>
        </form>

        <div style={styles.footerLinks}>
          <p>Don't have an account? <Link to="/signup" style={styles.footerLink}>Sign Up here.</Link></p>
          <p><Link to="/forgot-password" style={styles.footerLink}>Forgot Password?</Link></p>
          <p>
            Didn't receive the email? <a href="/resend-verification" style={styles.footerLink}>Resend Verification</a>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  login: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d0e6fd', // Light Blue
  },
  loginContainer: {
    maxWidth: '400px',
    padding: '25px',
    backgroundColor: '#162660', // Dark Blue
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
  },
  loginHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    color: '#f1e4d1', // Cream
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  logoImg: {
    height: '40px',
    marginRight: '10px',
  },
  navLink: {
    marginLeft: '15px',
    textDecoration: 'none',
    color: '#f1e4d1', // Cream
    transition: 'color 0.3s ease-in-out',
  },
  heading: {
    color: '#f1e4d1', // Cream
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '15px',
    textAlign: 'left',
  },
  label: {
    color: '#f1e4d1', // Cream
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #d0e6fd', // Light Blue
    borderRadius: '5px',
    background: 'transparent',
    color: '#f1e4d1', // Cream
  },
  button: {
    backgroundColor: '#d0e6fd', // Cream
    color: '#162660', // Dark Blue
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease-in-out',
  },
  footerLinks: {
    marginTop: '15px',
    color: '#f1e4d1', // Cream
  },
  footerLink: {
    color: '#d0e6fd', // Light Blue
    textDecoration: 'none',
  },
};

export default Login;
