import React, { useState, useEffect } from 'react'; // React hooks
import axios from 'axios'; // Axios for HTTP requests
import { FaTimes, FaWhatsapp } from 'react-icons/fa'; // React icons
import Alert from './Alert'; // Alert component
import TradeDetails from './TradeDetails'; // TradeDetails component
import '../styles/TradeCalculator.css'; // Import the CSS file



const TradeCalculator = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [ngnEquivalent, setNGNEquivalent] = useState(null);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [viewTradeDetails, setViewTradeDetails] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('usd'); // default to USD
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222";


  // Fetch services dynamically
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
  }, [apiUrl]);

  const handleServiceChange = (e) => {
    const service = e.target.value;
    setSelectedService(service);
    setReceiptVisible(false);
    setViewTradeDetails(false);
    setNGNEquivalent(null);
    setSelectedAmount('');
  };

  const handleAmountChange = (e) => {
    const amount = e.target.value;
    setSelectedAmount(amount);
    setNGNEquivalent(null);
    setReceiptVisible(false);
  };

  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
    setNGNEquivalent(null);
  };

  const handleAmountSelect = (e) => {
    const amount = Number(e.target.value); // Convert to number
    setSelectedAmount(amount);
    setNGNEquivalent(null);
    setReceiptVisible(false);
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

    const rate = service.exchangeRates[selectedCurrency]; // Dynamically get rate based on selected currency
    if (!rate) {
      setAlertMessage('Exchange rate not available!');
      setShowAlert(true);
      return;
    }

    let ngnEquivalent;

    // Logic for different amounts for Website Recharge:
    if (selectedService === 'Website Recharge') {
      if (selectedAmount === 5) {
        ngnEquivalent = rate * 1; // For 5 USD, no multiplier
      } else if (selectedAmount === 10) {
        ngnEquivalent = rate * 2; // For 10 USD, multiply by 2
      } else if (selectedAmount === 20) {
        ngnEquivalent = rate * 3; // For 20 USD, multiply by 3
      } else if (selectedAmount === 30) {
        ngnEquivalent = rate * 4; // For 30 USD, multiply by 4
      } else if (selectedAmount === 50) {
        ngnEquivalent = rate * 5; // For 50 USD, multiply by 5
      }
    } else {
      // For other services, calculate NGN equivalent directly
      ngnEquivalent = selectedAmount * rate;
    }

    // Check if ngnEquivalent is a valid number before using toFixed
    if (ngnEquivalent !== undefined && !isNaN(ngnEquivalent)) {
      setNGNEquivalent(ngnEquivalent.toFixed(2)); // Set the final NGN equivalent
    } else {
      setAlertMessage('Invalid calculation!');
      setShowAlert(true);
    }

    setReceiptVisible(true);
  };

  const handleShareReceipt = () => {
    const service = services.find((s) => s.name === selectedService);
    if (!service) return;

    const message = `
      *Trade Details:*
      Service: ${service.name}
      Amount (${selectedCurrency.toUpperCase()}): ${selectedAmount}
      Exchange Rate: ${service.exchangeRates[selectedCurrency]} NGN per ${selectedCurrency.toUpperCase()}
      NGN Equivalent: ₦${ngnEquivalent}
    `;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  const handleCloseReceipt = () => {
    setReceiptVisible(false);
  };

  const handleViewTradeDetails = () => {
    setReceiptVisible(false);
    setViewTradeDetails(true);
  };

  return (
    <div className="trade-calculator">
      <h2>Trade Calculator</h2>

      <div>
        <label>Service:</label>
        <select value={selectedService} onChange={handleServiceChange}>
          <option value="">Select Service</option>
          {services.map((service) => (
            <option key={service._id} value={service.name}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {selectedService && (
        <div className="exchange-rate-display">
          <p><strong>Current Exchange Rates:</strong></p>
          <p>USD: {services.find((s) => s.name === selectedService)?.exchangeRates.usd || 'N/A'} NGN</p>
          <p>EUR: {services.find((s) => s.name === selectedService)?.exchangeRates.eur || 'N/A'} NGN</p>
          <p>GBP: {services.find((s) => s.name === selectedService)?.exchangeRates.gbp || 'N/A'} NGN</p>
        </div>
      )}

      {selectedService && (
        <div>
          <label>Currency:</label>
          <select value={selectedCurrency} onChange={handleCurrencyChange}>
            <option value="usd">USD</option>
            <option value="eur">EUR</option>
            <option value="gbp">GBP</option>
          </select>
        </div>
      )}

      {selectedService === 'Website Recharge' ? (
        <div>
          <label>Amount:</label>
          <select value={selectedAmount} onChange={handleAmountSelect}>
            <option value="">Select Amount</option>
            <option value="5">5 USD</option>
            <option value="10">10 USD</option>
            <option value="20">20 USD</option>
            <option value="30">30 USD</option>
            <option value="50">50 USD</option>
          </select>
        </div>
      ) : (
        <div>
          <label>Amount:</label>
          <input
            type="number"
            value={selectedAmount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
          />
        </div>
      )}
      
      <button onClick={handleCalculate}>Calculate</button>

      {showAlert && <Alert message={alertMessage} onClose={() => setShowAlert(false)} />}

      {receiptVisible && ngnEquivalent !== null && (
        <div className="receipt-overlay">
          <div className="receipt">
            <h3>Trade Receipt</h3>
            <button className="close-btn" onClick={handleCloseReceipt}>
              <FaTimes />
            </button>
            <p><strong>Service:</strong> {selectedService}</p>
            <p><strong>Amount ({selectedCurrency.toUpperCase()}):</strong> {selectedAmount}</p>
            <p><strong>NGN Equivalent:</strong> ₦{ngnEquivalent.toLocaleString()}</p>
            <button onClick={handleViewTradeDetails}>Start Trade</button>
            <button onClick={handleShareReceipt}>Share on WhatsApp</button>
          </div>
        </div>
      )}

      {viewTradeDetails && selectedService && (
        <div className={`trade-details-container ${viewTradeDetails ? 'show' : ''}`}>
          <TradeDetails
            selectedService={selectedService}
            serviceDetails={services.find((s) => s.name === selectedService) || {}}
          />
        </div>
      )}

      <button
        className="whatsapp-support-btn"
        onClick={() => window.open('https://wa.me/', '_blank')}
      >
        <FaWhatsapp />
      </button>
    </div>
  );
};

export default TradeCalculator;
