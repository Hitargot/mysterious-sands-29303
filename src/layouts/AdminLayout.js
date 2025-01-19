import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import '../styles/AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [theme, setTheme] = useState('light'); // Default theme

  // Toggle theme function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Persist theme in localStorage to retain across page reloads
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []); // Runs once on component mount

  // Save the theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]); // Runs when the theme changes

  return (
    <div className={`admin-layout ${theme}`}>
      <AdminSidebar />
      <div className="admin-content">
        <AdminHeader onToggleTheme={toggleTheme} />
        <main>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
