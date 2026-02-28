import React, { useState, useEffect, useCallback } from 'react';
import { FaSun, FaMoon, FaSignOutAlt, FaKey } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/AdminHeader.css';
import { getAdminToken, getAdminPayload, removeAdminToken } from '../utils/adminAuth';

const AdminHeader = () => {
  const [adminName, setAdminName] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:22222';

  // Memoize handleLogout function with useCallback
  const handleLogout = useCallback(async () => {
    try {
      // Tell the server to clear the httpOnly cookie
      await fetch(`${apiUrl}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (_) {
      // Best-effort N/A proceed with client cleanup even if request fails
    }
    removeAdminToken();
    setAdminName('');
    navigate('/admin/login');
  }, [navigate, apiUrl]);

  // Authentication and expiration check effect
  useEffect(() => {
    // Prefer decoded payload from sessionStorage (set on login, no raw token needed)
    const payload = getAdminPayload();
    if (payload) {
      setAdminName(payload.username || '');
      // Check token expiry from payload
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        handleLogout();
        return;
      }
      return;
    }

    // Fallback: raw token still in storage (e.g. page refresh before cookie-only migration)
    const token = getAdminToken();
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setAdminName(decodedToken.username || '');
        if (decodedToken.exp && Date.now() >= decodedToken.exp * 1000) {
          handleLogout();
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        navigate('/admin/login');
      }
    } else {
      navigate('/admin/login');
    }
  }, [handleLogout, navigate]);

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
          <button
            className="icon-button"
            title="Change Password"
            onClick={() => navigate('/admin/change-password')}
            aria-label="Change password"
          >
            <FaKey />
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
