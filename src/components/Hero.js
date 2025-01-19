// src/components/Hero.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Hero.css'; // Import your Hero CSS

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login'); // Navigate to Login on click
  };

  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        <h1>Welcome to Exdollarium!</h1>
        <p>
          Your reliable solution for converting PayPal, Payoneer, and crypto to
          Naira at competitive rates.
        </p>
        <p>Say goodbye to exchange hassles with our secure and efficient process.</p>
        <button className="btn" onClick={handleGetStarted}>Get Started</button>
      </div>
    </section>
  );
};

export default Hero;
