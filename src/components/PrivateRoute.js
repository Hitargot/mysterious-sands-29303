import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Ensure jwt-decode is installed

const PrivateRoute = ({ children }) => {
  const isAuthorizedAdmin = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const { exp, role } = decoded;

      // Check if the token is expired and if the role is 'admin'
      const isTokenValid = Date.now() < exp * 1000;
      const isAdmin = role === 'admin';

      // If token is expired, clear it and deny access
      if (!isTokenValid) {
        localStorage.removeItem('adminToken'); // Remove the expired token
        return false;
      }

      return isTokenValid && isAdmin;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  };

  // Render the children if authorized or redirect to login
  return isAuthorizedAdmin() ? children : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;
