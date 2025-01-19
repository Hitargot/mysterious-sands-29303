import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/images/Exodollarium-01.png';

// Styled components for Header
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: black;
  padding: 20px;
  position: sticky; /* Make it sticky */
  top: 0; /* Stick to the top */
  z-index: 1000; /* Stay above other elements */
`;

const Logo = styled.div`
  display: flex;
  align-items: center;

  img {
    height: 40px;
    margin-right: 10px;
  }

  span {
    font-size: 24px;
    color: #00ffcc;
    font-weight: bold;
  }
`;

const MenuIcon = styled.div`
  display: none; /* Initially hidden */
  font-size: 1.8rem;
  color: white;
  cursor: pointer;
  padding: 0 10px; /* Same padding as logo */

  @media (max-width: 768px) {
    display: block; /* Show on mobile */
  }
`;

const Nav = styled.nav`
  ul {
    display: flex;
    list-style: none;

    li {
      margin-left: 15px;
    }

    a {
      color: white;
      text-decoration: none;
    }
  }

  /* Mobile Styles */
  @media (max-width: 768px) {
    ul {
      flex-direction: column;
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      align-items: center; /* Center menu items */
      justify-content: center;
      width: 100%;
      z-index: 999;
      transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
      background-color: rgba(0, 0, 0, 0.9); /* Semi-transparent black background */
    }

    ul.open {
      max-height: 100vh; /* Full viewport height */
      opacity: 1;
    }

    li {
      margin: 20px 0; /* Increased margin for better spacing */
      position: relative; /* Position for underline */
    }

    li a {
      font-size: 24px; /* Increase font size for better readability */
      position: relative; /* Ensure stacking context for ::after */
    }

    li a::after {
      content: '';
      display: block;
      width: 0;
      height: 2px;
      background-color: #237a57; /* Green underline color */
      transition: width 0.3s ease;
      position: absolute;
      bottom: -2px; /* Position it below the link */
      left: 0;
    }

    .close-icon {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 30px;
      cursor: pointer;
      color: #ffffff;
      display: block; /* Ensure it shows */
    }

    body.no-scroll {
      overflow: hidden; /* Prevent scrolling when overlay is active */
    }
  }
`;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prevState) => !prevState);
    document.body.classList.toggle('no-scroll', !isOpen); // Prevent body scroll when menu is open
  };

  return (
    <HeaderContainer>
      <Logo>
        <img src={logo} alt="Exdollarium logo" />
        <span>EXDOLLARIUM</span>
      </Logo>
      <MenuIcon onClick={toggleMenu}>☰</MenuIcon>
      <Nav>
        <ul className={isOpen ? 'open' : ''}>
          <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
          <li><a href="#about" onClick={toggleMenu}>About</a></li>
          <li><a href="#services" onClick={toggleMenu}>Services</a></li>
          <li><Link to="/testimonials" onClick={toggleMenu}>Testimonials</Link></li>
          <li><a href="#faq" onClick={toggleMenu}>FAQ</a></li>
          <li><a href="#contact" onClick={toggleMenu}>Contact</a></li>
          <li className="close-icon" onClick={toggleMenu}>✖</li> {/* Close icon */}
        </ul>
      </Nav>
    </HeaderContainer>
  );
}
