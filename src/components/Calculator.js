// src/components/Calculator.js

import React, { useState } from 'react';
import '../styles/Calculator.css'; // Importing custom styles

const Calculator = () => {
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [currency, setCurrency] = useState('usd');
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(400); // Default exchange rate
  const [result, setResult] = useState('');

  // Static exchange rates for demo purposes
  const rates = {
    paypal: { usd: 400, eur: 450, gbp: 500 },
    crypto: { usd: 420, eur: 470, gbp: 520 },
    payoneer: { usd: 410, eur: 460, gbp: 510 },
  };

  // Handle the change in payment method
  const handlePaymentMethodChange = (e) => {
    const selectedMethod = e.target.value;
    setPaymentMethod(selectedMethod);
    setExchangeRate(rates[selectedMethod][currency]); // Update the exchange rate based on selected method
  };

  // Handle the change in currency
  const handleCurrencyChange = (e) => {
    const selectedCurrency = e.target.value;
    setCurrency(selectedCurrency);
    setExchangeRate(rates[paymentMethod][selectedCurrency]); // Update exchange rate based on selected currency
  };

  // Handle calculation
  const handleCalculate = () => {
    const calculatedResult = exchangeRate * amount;
    setResult(`Amount in Naira: ${calculatedResult}`);
  };

  return (
    <section className="calculator-section">
      <h3>Exchange Rate Calculator</h3>
      <form id="exchange-form" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="payment-method">Select Payment Method:</label>
        <select
          id="payment-method"
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
        >
          <option value="paypal">PayPal</option>
          <option value="crypto">Crypto</option>
          <option value="payoneer">Payoneer</option>
          {/* Add other methods if necessary */}
        </select>

        <label htmlFor="currency">Select Currency:</label>
        <select
          id="currency"
          value={currency}
          onChange={handleCurrencyChange}
        >
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
          <option value="gbp">GBP</option>
          {/* Add more currency options as needed */}
        </select>

        <div id="exchange-rate-info">
          <label htmlFor="exchange-rate">Exchange Rate:</label>
          <span id="exchange-rate">{exchangeRate}</span> {/* Display exchange rate as text */}
        </div>

        <label htmlFor="amount">Enter Amount:</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="0"
          required
        />

        <button type="button" id="calculate-button" onClick={handleCalculate}>
          Calculate
        </button>
      </form>

      <div id="result">{result}</div>
    </section>
  );
};

export default Calculator;
