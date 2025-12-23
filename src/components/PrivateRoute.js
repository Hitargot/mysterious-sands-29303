import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Ensure jwt-decode is installed

/**
 * PrivateRoute
 * Props:
 *  - children: element(s) to render when authorized
 *  - adminOnly (bool): when true, require an adminToken and admin role
 *
 * Behavior:
 *  - If adminOnly, validate adminToken (expiry + role === 'admin') -> if invalid redirect to /admin/login
 *  - Otherwise validate jwtToken (expiry if present) -> if invalid redirect to '/'
 */
const PrivateRoute = ({ children, adminOnly = false }) => {
  const validateAdmin = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const { exp, role } = decoded || {};
      const isTokenValid = !exp || Date.now() < exp * 1000;
      const isAdmin = role === 'admin';
      if (!isTokenValid) {
        localStorage.removeItem('adminToken');
        return false;
      }
      return isTokenValid && isAdmin;
    } catch (e) {
      // If token isn't a JWT with exp/role, fall back to truthy token check
      return !!token;
    }
  };

  const validateUser = () => {
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const { exp } = decoded || {};
      const isTokenValid = !exp || Date.now() < exp * 1000;
      if (!isTokenValid) {
        localStorage.removeItem('jwtToken');
        sessionStorage.removeItem('jwtToken');
        return false;
      }
      return isTokenValid;
    } catch (e) {
      // If decode fails, assume token presence means logged in
      return !!token;
    }
  };

  if (adminOnly) {
    return validateAdmin() ? children : <Navigate to="/admin/login" replace />;
  }

  return validateUser() ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
