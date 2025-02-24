import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Alert from '../components/Alert';
import logo from '../assets/images/Exodollarium-01.png'; // Import image

const styles = {
  resetPassword: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d0e6fd', // Light Blue
  },
  container: {
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
    fontWeight: 'bold',
  },
  logoImg: {
    height: '30px',
    marginRight: '10px',
  },
  navLink: {
    marginLeft: '15px',
    textDecoration: 'none',
    color: '#d0e6fd', // Light Blue
    transition: 'color 0.3s ease-in-out',
  },
  heading: {
    color: '#f1e4d1', // Cream
    marginBottom: '15px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #d0e6fd', // Light Blue
    borderRadius: '5px',
    background: 'transparent',
    color: '#f1e4d1', // Cream
    marginBottom: '10px',
  },
  button: {
    backgroundColor: '#d0e6fd', // Light Blue
    color: '#162660', // Dark Blue
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease-in-out',
  },
  buttonHover: {
    backgroundColor: '#b5d4fa', // Lighter Blue
  },
  footer: {
    marginTop: '15px',
    color: '#f1e4d1', // Cream
  },
  link: {
    color: '#d0e6fd', // Light Blue
    textDecoration: 'none',
  },
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [isHovered, setIsHovered] = useState(false);

  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlert({ message: "Passwords don't match.", type: 'error' });
      return;
    }

    try {
      await axios.post(`${apiUrl}/api/auth/reset-password/${token}`, { password });

      setAlert({ message: 'Password reset successful! Redirecting to login...', type: 'success' });

      setPassword('');
      setConfirmPassword('');

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

      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div style={styles.resetPassword}>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.loginHeader}>
          <div style={styles.logo}>
            <img src={logo} alt="Logo" style={styles.logoImg} />
            <span>Exdollarium</span>
          </div>
          <nav>
            <Link to="/" style={styles.navLink}>Home</Link>
            <Link to="/signup" style={styles.navLink}>Signup</Link>
          </nav>
        </header>

        {/* Reset Password Form */}
        <h2 style={styles.heading}>Reset Password</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(isHovered ? styles.buttonHover : {}),
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Reset Password
          </button>
        </form>
        {alert.message && <Alert message={alert.message} type={alert.type} />}
        <div style={styles.footer}>
          <p>
            Remembered your password? <Link to="/login" style={styles.link}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
