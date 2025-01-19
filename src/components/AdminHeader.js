import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa'; // Include both icons
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Decode JWT
import '../styles/AdminHeader.css';

const AdminHeader = () => {
  const [adminName, setAdminName] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark'); // Default to 'dark' if no theme set
  const navigate = useNavigate();

  // Fetch admin info and set greeting, check if password is expired
  useEffect(() => {
    const token = localStorage.getItem('adminToken'); // Use localStorage for the token
    const tempPasswordExpiresAt = localStorage.getItem('tempPasswordExpiresAt'); // Get expiration time from localStorage

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setAdminName(decodedToken.username); // Set the username from token

        // Check if the temp password is expired
        if (tempPasswordExpiresAt && Date.now() > parseInt(tempPasswordExpiresAt, 10)) {
          alert('Your temporary password has expired. Please log in again.');
          handleLogout(); // Logout if expired
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        navigate('/admin/login');
      }
    } else {
      navigate('/admin/login');
    }

    // Apply the theme to the body
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('light-theme', theme === 'light');
  }, [theme, navigate]); // Re-run when theme changes

  // Toggle theme and save preference
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Save theme to localStorage
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('tempPasswordExpiresAt');
    setAdminName('');
    navigate('/admin/login');
  };


  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <div className="header-controls">
          <span className="admin-name">Welcome, {adminName || 'Admin'}</span>
          <button className="icon-button" onClick={toggleTheme}>
            {theme === 'light' ? <FaSun /> : <FaMoon />} {/* Toggle between light and dark theme icons */}
          </button>
          <div className="logout-container" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
            <span className="logout-text">Logout</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
