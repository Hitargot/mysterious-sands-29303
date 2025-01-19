// src/components/Services.js

import React from 'react';
import '../styles/Services.css'; // Importing custom styles

const Services = () => {
  return (
    <section id="services" className="services-section">
      <h2>Our Services</h2>
      <p>Explore our range of services by scrolling through the icons below.</p>
      <div className="service-icons">
        <div className="service-icon">
          <img src={require('../assets/images/path_to_paypal_icon.png')} alt="PayPal Exchange" />
          <p>PayPal Exchange</p>
        </div>
        <div className="service-icon">
          <img src={require('../assets/images/path_to_crypto_icon.png')} alt="Crypto Exchange" />
          <p>Crypto Exchange (BTC, USDT, ETH, etc.)</p>
        </div>
        <div className="service-icon">
          <img src={require('../assets/images/path_to_payonee.png')} alt="Payoneer Exchange" />
          <p>Payoneer Exchange</p>
        </div>
        <div className="service-icon">
          <img src={require('../assets/images/path_to_fiverr.png')} alt="Fiverr Withdrawal" />
          <p>Fiverr Withdrawal</p>
        </div>
        <div className="service-icon">
          <img src={require('../assets/images/path_to_us_bank_icon.png')} alt="US Bank Transfer" />
          <p>US Bank Transfer</p>
        </div>
        <div className="service-icon">
          <img src={require('../assets/images/path_to_upwork_icon.png')} alt="Upwork Withdrawal" />
          <p>Upwork Withdrawal</p>
        </div>
        <div className="service-icon">
          <img src={require('../assets/images/path_to_website_recharge_icon.png')} alt="Website Recharge" />
          <p>Website Recharge (smscode, pivapin)</p>
        </div>
      </div>
    </section>
  );
};

export default Services;
