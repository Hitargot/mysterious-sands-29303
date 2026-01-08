import React from 'react';
import heroImg from '../assets/images/Exo-Hero-Man (2).png';
import '../styles/style.css';
import Header from './Header';

const Hero = () => {
  return (
    <section className="hero-section" id="home">
      {/* Header spans the full hero so the nav can sit on the orange (right) side */}
      <Header />
      <div className="side">
        <div className="content-limit-left">
          <h1 className="main-title">THE FUTURE OF SEAMLESS EXCHANGE AND INSTANT PAYOUT.</h1>
          <p className="hero-desc">Easily exchange your digital funds (gift card, PayPal, Payoneer, and crypto) for Naira! Enjoy fast, secure, and reliable transactions with no delays or hidden fees, trusted by thousands and offering the best rate for maximum value!</p>

          <div className="milestone">
            <div className="rate">
              <h2 className="rateHeading">98%</h2>
              <p className="rateSub">COMPLETION</p>
            </div>
            <div className="rate">
              <h2 className="rateHeading">1K+</h2>
              <p className="rateSub">PROJECTS</p>
            </div>
            <div className="rate">
              <h2 className="rateHeading">96%</h2>
              <p className="rateSub">SATISFACTION</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta side">
        <div className="content-limit-right">
          <div className="steps-grid">
            <div className="step-box"><div className="step-text">Create a unique account.</div></div>
            <div className="step-box"><div className="step-text">Send fund to company tag.</div></div>
            <div className="step-box"><div className="step-text">Your naira land in your bank.</div></div>
            <div className="step-box"><div className="step-text">An admin approve it.</div></div>
            <div className="center-circle">
              <div className="inner-icon">&#8635;</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero illustration/image - replace with Exo hero PNG in assets for the intended visual */}
      <img src={heroImg} alt="Hero Illustration" className="Hero-man" />
    </section>
  );
};

export default Hero;