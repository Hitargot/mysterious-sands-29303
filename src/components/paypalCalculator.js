import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ResponsiveLogo from './ResponsiveLogo';

const PayPalFeeCalculator = () => {
  const [amount, setAmount] = useState('');  // Amount user enters (either send or receive)
  const [mode, setMode] = useState('sending'); // 'sending' or 'receiving'
  const feePercentage = 0.044;  // 4.4% fee rate
  const fixedFee = 0.3; // Fixed fee (0.30 USD)

  // Calculate fee, net, and gross amounts based on mode (sending or receiving)
  const calculate = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return { feePercentageAmount: 0, fixedFeeAmount: 0, net: 0, gross: 0 };

    if (mode === 'sending') {
      // Sending: Calculate fee based on the entered amount
      const feePercentageAmount = amt * feePercentage;
      const fixedFeeAmount = fixedFee;
      const totalFee = feePercentageAmount + fixedFeeAmount;
      const net = amt - totalFee;
      return { feePercentageAmount, fixedFeeAmount, totalFee, net, gross: amt };
    } else {
      // Receiving: Calculate the amount to send to receive the entered amount
      const gross = (amt + fixedFee) / (1 - feePercentage);
      const feePercentageAmount = gross * feePercentage;
      const fixedFeeAmount = fixedFee;
      const totalFee = feePercentageAmount + fixedFeeAmount;
      return { feePercentageAmount, fixedFeeAmount, totalFee, net: amt, gross };
    }
  };

  const { totalFee, net, gross } = calculate();

  // Function to calculate how much the user should ask for to receive a specific amount
  const calculateAskAmount = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return 0;
    
    const gross = (amt + fixedFee) / (1 - feePercentage); // To receive the desired amount, this is what the sender should send
    return gross;
  };

  const askAmount = calculateAskAmount();

  const styles = {
    container: {
      maxWidth: '500px',
      margin: '2rem auto',
      padding: '1.5rem',
      border: '1px solid #162660',  // Blue border similar to Login component
      borderRadius: '10px',
      backgroundColor: '#fff',
      fontFamily: 'sans-serif',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '20px',
      borderBottom: '2px solid #162660',  // Same blue for consistency
      marginBottom: '1.5rem',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
    },
    logoImg: {
      height: '40px',
      marginRight: '10px',
    },
    homeButton: {
      padding: '10px 15px',
      backgroundColor: '#162660',  // Matching the button color with Login header
      color: '#fff',
      textDecoration: 'none',
      borderRadius: '5px',
      transition: 'background-color 0.3s ease',
      fontSize: '16px',
    },
    homeButtonHover: {
      backgroundColor: '#0d1a2a',  // Slightly darker on hover
    },
    input: {
      width: '100%',
      padding: '10px',
      fontSize: '16px',
      marginBottom: '1rem',
      borderRadius: '6px',
      border: '1px solid #ddd',
    },
    toggle: {
      marginBottom: '1rem',
      display: 'flex',
      gap: '1rem',
    },
    result: {
      marginTop: '1.5rem',
      lineHeight: '1.6',
      backgroundColor: '#f9f9f9',
      padding: '1rem',
      borderRadius: '8px',
    },
    disclaimer: {
      fontSize: '12px',
      color: '#777',
      marginTop: '1rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <ResponsiveLogo alt="Exdollarium" style={styles.logoImg} />
          <span style={{ color: '#162660', fontWeight: 'bold' }}>Exdollarium</span>
        </div>
        <Link to="/" style={styles.homeButton}>
          Home
        </Link>
      </div>

      <h2 style={{ marginBottom: '1rem', textAlign: 'center', color: '#162660' }}>
        PayPal Fee Calculator
      </h2>

      <div style={styles.toggle}>
        <label>
          <input
            type="radio"
            name="mode"
            value="sending"
            checked={mode === 'sending'}
            onChange={() => setMode('sending')}
          />{' '}
          You’re sending
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="receiving"
            checked={mode === 'receiving'}
            onChange={() => setMode('receiving')}
          />{' '}
          You want to receive
        </label>
      </div>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={styles.input}
      />

      <div style={styles.result}>
        {mode === 'sending' ? (
          <>
            <p><strong>PayPal Fees = 4.4% + $0.30</strong></p>
            <p><strong>Total Fees:</strong> ${(totalFee || 0).toFixed(2)}</p>
            <p><strong>You will receive:</strong> ${(net || 0).toFixed(2)}</p>
            <p><strong>If you invoice for ${amount}:</strong> You should ask for ${(askAmount || 0).toFixed(2)}</p>
          </>
        ) : (
          <>
            <p><strong>PayPal Fees: 4.4% + $0.30</strong></p>
            <p><strong>Total Fees:</strong> ${(totalFee || 0).toFixed(2)}</p>
            <p><strong>You should send:</strong> ${(gross || 0).toFixed(2)}</p>
            <p><strong>If you want to receive ${amount}:</strong> You need to send ${(gross || 0).toFixed(2)}</p>
          </>
        )}
      </div>

      <p style={styles.disclaimer}>
        This calculator is for estimation purposes only. Actual fees may vary based on PayPal's rates and regional policies.
      </p>
    </div>
  );
};

export default PayPalFeeCalculator;
