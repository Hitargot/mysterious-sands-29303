import React from "react";
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import paypalIcon from "../assets/images/path_to_paypal_icon.png";
import cryptoIcon from "../assets/images/path_to_crypto_icon.png";
import payoneerIcon from "../assets/images/path_to_payonee.png";
import fiverrIcon from "../assets/images/path_to_fiverr.png";
import usBankIcon from "../assets/images/path_to_us_bank_icon.png";
import upworkIcon from "../assets/images/path_to_upwork_icon.png";
import websiteRechargeIcon from "../assets/images/path_to_website_recharge_icon.png";
import cardIcon from "../assets/images/2019-01-30-gift-cards.jpeg";

const services = [
  { name: "PayPal Exchange", icon: paypalIcon, desc: "Convert PayPal balances to Naira quickly with competitive rates." },
  { name: "Crypto Exchange", icon: cryptoIcon, desc: "Buy/sell BTC, USDT, ETH and more with instant settlement." },
  { name: "Gift Card Redeem", icon: cardIcon, desc: "Redeem Steam, Apple, iTunes and other gift cards for cash." },
  { name: "Payoneer Exchange", icon: payoneerIcon, desc: "Withdraw Payoneer balances to your local account easily." },
  { name: "Fiverr Withdrawal", icon: fiverrIcon, desc: "Get paid from Fiverr and convert to Naira or local bank transfers." },
  { name: "US Bank Transfer", icon: usBankIcon, desc: "Receive USD payouts directly to your US bank account." },
  { name: "Upwork Withdrawal", icon: upworkIcon, desc: "Withdraw your Upwork earnings fast and securely." },
  { name: "Website Recharge", icon: websiteRechargeIcon, desc: "Top-up websites and services using smscode and pivapin methods." },
];

const ServicesSection = styled.section`
  background: linear-gradient(135deg, #d0e6fd, #f1e4d1);
  color: #162660;
  padding: 60px 20px;
  text-align: center;
  position: relative;
`;

/* two-column layout removed; calculator panel lives elsewhere on the page */

const Heading = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: bold;
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto;
  align-items: stretch;
`;

const ServiceCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  box-shadow: 0 6px 20px rgba(16,24,40,0.08);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.28s ease, box-shadow 0.28s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 18px 40px rgba(16,24,40,0.12);
  }

  .top {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  img {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 10px;
    background: #f7fafc;
  }

  h3 {
    margin: 0;
    font-size: 1.05rem;
    color: #162660;
  }

  p.desc {
    margin: 12px 0 0 0;
    color: #475569;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .cta-row {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  button {
    background: #162660;
    color: #fff;
    border: none;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
  }
`;

/* Arrow buttons removed - grid layout uses direct CTA */

const Services = () => {
  const navigate = useNavigate();
  return (
    <ServicesSection id="services">
      <Heading>Our Services</Heading>
      <Description>We offer a wide range of exchange and payout services — fast, secure and reliable. Click a service to get started.</Description>

      <Grid>
        {services.map((s, i) => (
          <ServiceCard key={i} role="article" aria-label={s.name}>
            <div>
              <div className="top">
                <img src={s.icon} alt={s.name} />
                <div>
                  <h3>{s.name}</h3>
                </div>
              </div>
              <p className="desc">{s.desc}</p>
            </div>
            <div className="cta-row">
              <button onClick={() => {
                const el = document.getElementById('calculator');
                  if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  const input = el.querySelector('select, input');
                  if (input) input.focus();
                } else {
                  navigate('/services');
                }
              }}>Exchange</button>
            </div>
          </ServiceCard>
        ))}
      </Grid>
    </ServicesSection>
  );
};

export default Services;