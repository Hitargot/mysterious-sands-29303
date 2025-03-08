import React from 'react';
import { Link } from 'react-router-dom';

const TestimonialsHeader = () => {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        backgroundColor: "#0A0A23",
        color: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0px 4px 10px rgba(0, 255, 204, 0.2)",
        flexWrap: "wrap" // Ensure items wrap on smaller screens
      }}
    >
      {/* Logo Section */}
      <div 
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0 // Prevents the logo from shrinking
        }}
      >
        <img
          src={require('../assets/images/Exodollarium-01.png')}
          alt="Logo"
          style={{
            height: "50px",
            width: "auto",
            maxWidth: "100%", // Ensures responsiveness
          }}
        />
        <span
          style={{
            fontSize: "20px", 
            color: "#00ffcc", 
            fontWeight: "bold",
            whiteSpace: "nowrap" // Prevents text from wrapping
          }}
        >
          Exdollarium
        </span>
      </div>

      {/* Navigation */}
      <nav 
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: 500,
          flexWrap: "wrap", 
          justifyContent: "center",
          width: "auto",
          marginTop: "10px"
        }}
      >
        <Link 
          to="/" 
          style={{
            color: "#fff",
            textDecoration: "none",
            fontSize: "14px",
            padding: "8px 12px",
            transition: "color 0.3s ease, transform 0.2s ease"
          }}
          onMouseEnter={(e) => e.target.style.color = "#00ffcc"}
          onMouseLeave={(e) => e.target.style.color = "#fff"}
        >
          Home
        </Link>

        {/* Login Button */}
        <Link 
          to="/login" 
          style={{
            padding: "8px 16px",
            border: "2px solid #fff",
            borderRadius: "50px",
            backgroundColor: "transparent",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background-color 0.3s, transform 0.2s ease",
            textDecoration: "none",
            fontSize: "14px"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "orange";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.transform = "scale(1)";
          }}
        >
          Login
        </Link>
      </nav>
    </header>
  );
};

export default TestimonialsHeader;
