// src/pages/Home.js

import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Calculator from '../components/Calculator';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div>
      <Header />
      <Hero />
      <About />
      <Services />
      <Calculator />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
};

export default Home;
