import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const RolePrivateRoute = ({ children, requiredRole, requiredPermissions = [] }) => {
  const isAuthorized = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const { exp, role, permissions } = decoded;

      // Check if the token is expired
      if (Date.now() >= exp * 1000) return false;

      // Check if the user has the required role
      if (requiredRole && role !== requiredRole) return false;

      // Check if the user has the required permissions
      if (
        requiredPermissions.length &&
        !requiredPermissions.every((perm) => permissions?.includes(perm))
      ) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  };

  // Render children if authorized; otherwise, redirect to login
  return isAuthorized() ? children : <Navigate to="/login" replace />;
};

export default RolePrivateRoute;
