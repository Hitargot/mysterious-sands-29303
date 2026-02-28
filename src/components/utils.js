// src/utils.js
import {jwtDecode} from 'jwt-decode';
import { getAdminToken } from '../utils/adminAuth';

export const getUserRole = () => {
  const token = getAdminToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.roleName; // return the roleName, such as 'admin', 'user', etc.
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserPermissions = () => {
  const token = getAdminToken();
  if (!token) return [];
  try {
    const decoded = jwtDecode(token);
    return decoded.permissions || []; // return the permissions array
  } catch (error) {
    console.error('Error decoding token:', error);
    return [];
  }
};
