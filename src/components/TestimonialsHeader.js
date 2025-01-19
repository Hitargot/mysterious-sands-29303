// src/components/TestimonialsHeader.js

import React from 'react';
import { Link } from 'react-router-dom'; // Make sure to import Link for navigation
import '../styles/TestimonialsHeader.css'; // Import your CSS file

const TestimonialsHeader = () => {
  return (
    <header className="testimonials-header">
      <div className="logo">
        <img src={require('../assets/images/Exodollarium-01.png')} alt="Logo" /> {/* Adjust the path to your logo */}
        <span>Exdollarium</span> {/* Your project name */}
      </div>
      <nav>
        <Link to="/" className="home">Home</Link>
        <Link to="/login" className="login-button">Login</Link> {/* Add the login button styles */}
      </nav>
    </header>
  );
};

export default TestimonialsHeader;

