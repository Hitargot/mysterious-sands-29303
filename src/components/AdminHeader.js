import React, { useState, useEffect, useCallback } from 'react';
import { FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/AdminHeader.css';

const AdminHeader = () => {
  const [adminName, setAdminName] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const navigate = useNavigate();

  // Memoize handleLogout function with useCallback
  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('tempPasswordExpiresAt');
    setAdminName('');
    navigate('/admin/login');
  }, [navigate]);

  // Authentication and expiration check effect
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const tempPasswordExpiresAt = localStorage.getItem('tempPasswordExpiresAt');

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setAdminName(decodedToken.username);

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
  }, [handleLogout, navigate]); // `handleLogout` is now memoized, no need to worry about re-creating it

  // Theme change effect
  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('light-theme', theme === 'light');
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <div className="header-controls">
          <span className="admin-name">Welcome, {adminName || 'Admin'}</span>
          <button className="icon-button" onClick={toggleTheme}>
            {theme === 'light' ? <FaSun /> : <FaMoon />}
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
