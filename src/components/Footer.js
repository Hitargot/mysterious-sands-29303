// src/components/Footer.js

import React from 'react';
import '../styles/Footer.css'; // Importing custom styles
// Uncomment if you're using Font Awesome icons
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="https://chat.whatsapp.com/LcT3Fe47rPtCjjL2ZISHcP" target="_blank" rel="noopener noreferrer">
          <span className="icon">
            <i className="fab fa-whatsapp"></i>
          </span>
          <span className="link-text">WhatsApp</span>
        </a>
        <a href="https://www.instagram.com/exdollarium/" target="_blank" rel="noopener noreferrer">
          <span className="icon">
            <i className="fab fa-instagram"></i>
          </span>
          <span className="link-text">Instagram</span>
        </a>
        <a href="https://twitter.com/exdollarium/" target="_blank" rel="noopener noreferrer">
          <span className="icon">
            <i className="fab fa-twitter"></i>
          </span>
          <span className="link-text">Twitter</span>
        </a>
        <a href="https://www.facebook.com/profile.php?id=61561183927502" target="_blank" rel="noopener noreferrer">
          <span className="icon">
            <i className="fab fa-facebook"></i>
          </span>
          <span className="link-text">Facebook</span>
        </a>
      </div>
      <p>&copy; 2024 Exdollarium. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
