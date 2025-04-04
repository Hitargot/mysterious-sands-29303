import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import Alert from '../components/Alert'; // Adjust the path if necessary

const WithdrawalPinInput = ({ onPinSubmit }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e, index) => {
    const value = e.target.value;
    // Allow only one character per input, numeric values only
    if (value.length <= 1 && /^[0-9]$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      if (index < 3 && value !== '') {
        document.getElementById(`pin-input-${index + 1}`).focus();
      }
    } else if (value === '') {
      const newPin = [...pin];
      newPin[index] = '';
      setPin(newPin);

      // Move focus to the previous field when deleting
      if (index > 0) {
        document.getElementById(`pin-input-${index - 1}`).focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const pinValue = pin.join('');

    if (pin.every((digit) => digit === '')) {
      setAlert({ type: 'error', message: 'Please enter your 4-digit PIN' });
      return;
    }

    if (pinValue.length !== 4) {
      setAlert({ type: 'error', message: 'Please enter a complete 4-digit PIN' });
      return;
    }

    setIsSubmitting(true);
    setAlert(null); // Clear previous alerts

    setTimeout(() => {
      onPinSubmit(pinValue); // Call the onPinSubmit function passed as prop
      setIsSubmitting(false);
      setAlert({ type: 'success', message: 'PIN submitted successfully!' });

      // Clear input fields and reset form states after submission
      setPin(['', '', '', '']); // Reset PIN input
      setIsPasswordVisible(false); // Optionally reset password visibility
      setIsSubmitting(false); // Reset submitting status
      setAlert(null); // Reset alert state if necessary
    }, 2000);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleResetPin = () => {
    // Redirect to /reset-otp
    navigate('/request-otp');
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        maxWidth: '400px',
        margin: '10px auto',
        borderRadius: '10px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h3
        style={{
          marginBottom: '15px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333',
        }}
      >
        Enter Your Withdrawal PIN
      </h3>

      {/* Alert Component */}
      {alert && <Alert type={alert.type} message={alert.message} />}

      <div
        className="pin-input-container"
        style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '15px' }}
      >
        {pin.map((digit, index) => (
          <div key={index}>
            <input
              id={`pin-input-${index}`}
              type={isPasswordVisible ? 'text' : 'password'}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              maxLength="1"
              style={{
                width: '30px',
                height: '30px',
                fontSize: '22px',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '2px solid rgb(208, 230, 253)',
                borderRadius: '8px',
                outline: 'none',
                padding: '10px',
                transition: 'border 0.2s ease, box-shadow 0.3s ease',
                backgroundColor: '#fff',
              }}
              onFocus={(e) => e.target.select()}
              placeholder="•"
            />
          </div>
        ))}
      </div>

      {/* Always show the eye icon */}
      <button
        type="button"
        onClick={togglePasswordVisibility}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          color: '#007BFF',
          marginBottom: '10px',
        }}
      >
        {isPasswordVisible ? '🙈' : '👁️'}
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: '12px 25px',
          backgroundColor: isSubmitting ? 'rgb(241, 228, 209)' : 'rgb(22, 38, 96)',
          color: isSubmitting ? 'rgb(22, 38, 96)' : 'rgb(241, 228, 209)',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s ease',
        }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit PIN'}
      </button>

      {/* Reset PIN Link */}
      <button
        type="button"
        onClick={handleResetPin}
        style={{
          marginTop: '15px',
          color: '#007BFF',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        Reset PIN
      </button>
    </form>
  );
};

export default WithdrawalPinInput;
