import React, { useEffect, useState } from 'react';
import '../styles/Alert.css'; // Import your alert styles

const Alert = ({ message, type = 'error', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose(); // Call onClose if it's a function
    }, duration);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [duration, onClose]);

  return (
    visible && (
      <div className={`alert ${type}`}>
        <span>{message}</span>
        <div className="alert-progress" style={{ animationDuration: `${duration}ms` }}></div>
      </div>
    )
  );
};

export default Alert;
