import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Calculator = () => {
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222";
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('usd');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [ngnEquivalent, setNGNEquivalent] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/services`);
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  const handleServiceChange = (e) => {
    setSelectedService(e.target.value);
    setNGNEquivalent(null);
    setSelectedAmount('');
  };

  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
    setNGNEquivalent(null);
  };

  const handleAmountChange = (e) => {
    setSelectedAmount(e.target.value);
    setNGNEquivalent(null);
  };

  const handleAmountSelect = (e) => {
    setSelectedAmount(Number(e.target.value));
    setNGNEquivalent(null);
  };

  const handleCalculate = () => {
    if (!selectedService) {
      setAlertMessage('Please select a service!');
      setShowAlert(true);
      return;
    }

    if (!selectedAmount || isNaN(selectedAmount)) {
      setAlertMessage('Please enter a valid amount!');
      setShowAlert(true);
      return;
    }

    const service = services.find((s) => s.name === selectedService);
    if (!service) {
      setAlertMessage('Invalid service selected!');
      setShowAlert(true);
      return;
    }

    if (selectedService === 'Website Recharge' && selectedAmount < 5) {
      setAlertMessage('Minimum amount for Website Recharge is 5 USD.');
      setShowAlert(true);
      return;
    }

    const rate = service.exchangeRates[selectedCurrency];
    if (!rate) {
      setAlertMessage('Exchange rate not available!');
      setShowAlert(true);
      return;
    }

    let ngnEquivalent;
    if (selectedService === 'Website Recharge') {
      const multipliers = { 5: 1, 10: 2, 20: 3, 30: 4, 50: 5 };
      ngnEquivalent = rate * (multipliers[selectedAmount] || 1);
    } else {
      ngnEquivalent = selectedAmount * rate;
    }

    if (ngnEquivalent !== undefined && !isNaN(ngnEquivalent)) {
      setNGNEquivalent(ngnEquivalent.toFixed(2));
    } else {
      setAlertMessage('Invalid calculation!');
      setShowAlert(true);
    }
  };

  return (
    <section style={styles.calculatorContainer}>
      <h3 style={styles.heading}>Exchange Rate Calculator</h3>
      
      {showAlert && <div style={styles.alert}>{alertMessage}</div>}

      <div style={styles.formGroup}>
        <label style={styles.label}>Service:</label>
        <select value={selectedService} onChange={handleServiceChange} style={styles.select}>
          <option value="">Select Service</option>
          {services.map((service) => (
            <option key={service._id} value={service.name}>{service.name}</option>
          ))}
        </select>
      </div>

      {selectedService && (
        <div style={styles.exchangeRateBox}>
          <p><strong>Current Exchange Rates:</strong></p>
          <p>USD: {services.find((s) => s.name === selectedService)?.exchangeRates.usd || 'N/A'} NGN</p>
          <p>EUR: {services.find((s) => s.name === selectedService)?.exchangeRates.eur || 'N/A'} NGN</p>
          <p>GBP: {services.find((s) => s.name === selectedService)?.exchangeRates.gbp || 'N/A'} NGN</p>
        </div>
      )}

      {selectedService && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Currency:</label>
          <select value={selectedCurrency} onChange={handleCurrencyChange} style={styles.select}>
            <option value="usd">USD</option>
            <option value="eur">EUR</option>
            <option value="gbp">GBP</option>
          </select>
        </div>
      )}

      {selectedService === 'Website Recharge' ? (
        <div style={styles.formGroup}>
          <label style={styles.label}>Amount:</label>
          <select value={selectedAmount} onChange={handleAmountSelect} style={styles.select}>
            <option value="">Select Amount</option>
            <option value="5">5 USD</option>
            <option value="10">10 USD</option>
            <option value="20">20 USD</option>
            <option value="30">30 USD</option>
            <option value="50">50 USD</option>
          </select>
        </div>
      ) : (
        <div style={styles.formGroup}>
          <label style={styles.label}>Amount:</label>
          <input 
            type="number" 
            value={selectedAmount} 
            onChange={handleAmountChange} 
            placeholder="Enter amount" 
            style={styles.input} 
          />
        </div>
      )}

      <button onClick={handleCalculate} style={styles.button}>Calculate</button>

      {ngnEquivalent && (
        <div style={styles.result}>
          <h4>NGN Equivalent: {ngnEquivalent.toLocaleString()} NGN</h4>
        </div>
      )}
    </section>
  );
};

// **Styled Components**
const styles = {
  calculatorContainer: {
    backgroundColor: '#d0e6fd',
    padding: '40px',
    borderRadius: '10px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '40px auto',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    color: '#162660',
    fontSize: '1.5rem',
    marginBottom: '20px',
  },
  alert: {
    backgroundColor: '#f1e4d1',
    padding: '10px',
    borderRadius: '5px',
    color: '#162660',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    color: '#162660',
    marginBottom: '5px',
  },
  select: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #162660',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #162660',
  },
  button: {
    backgroundColor: '#162660',
    color: '#f1e4d1',
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s, transform 0.2s',
  },
  result: {
    marginTop: '20px',
    fontWeight: 'bold',
    color: '#162660',
  },
};

export default Calculator;
