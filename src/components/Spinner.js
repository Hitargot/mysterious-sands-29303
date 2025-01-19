import React from 'react';
import '../styles/Spinner.css'; // Ensure this file exists for styling
import logo from '../assets/images/Exodollarium-01.png'; // Adjust the path to your logo file

const Spinner = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <img src={logo} alt="Loading..." className="spinner-logo" />
      </div>
    </div>
  );
};

export default Spinner;
