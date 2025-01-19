// src/utils/auth.js

export const getJwtToken = () => {
    return localStorage.getItem('jwtToken'); // Retrieve JWT token from localStorage
  };
  
  export const clearJwtToken = () => {
    localStorage.removeItem('jwtToken'); // Clear JWT token from localStorage
  };
  
  export const setJwtToken = (token) => {
    localStorage.setItem('jwtToken', token); // Set JWT token in localStorage
  };
  