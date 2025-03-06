import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/images/Exodollarium-01.png';

// Styled components for Header
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #162660; /* Deep Navy Blue */
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 1000;
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
    color: #d0e6fd; /* Light Sky Blue */
    font-weight: bold;
  }
`;

const MenuIcon = styled.div`
  display: none;
  font-size: 1.8rem;
  color: #f1e4d1; /* Soft Beige */
  cursor: pointer;
  padding: 0 10px;

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
      color: #f1e4d1;
      text-decoration: none;
      transition: color 0.3s ease-in-out;
    }

    a:hover {
      color: #d0e6fd;
    }
  }

  /* Mobile Styles */
  @media (max-width: 768px) {
    ul {
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background-color: rgba(22, 38, 96, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translateY(-100%);
      transition: transform 0.4s ease-in-out, opacity 0.3s ease-in-out;
      opacity: 0;
    }

    ul.open {
      transform: translateY(0);
      opacity: 1;
    }

    li {
      margin: 20px 0;
      font-size: 24px;
    }

    /* Hide close icon on desktop */
    .close-icon {
      position: absolute;
      top: 15px;
      right: 100px;
      font-size: 30px;
      cursor: pointer;
      color: #fff;
      display: none; /* Hide by default */
    }

    ul.open .close-icon {
      display: block; /* Show only when menu is open on mobile */
    }

    body.no-scroll {
      overflow: hidden;
    }
  }
`;


export { HeaderContainer, Logo, MenuIcon, Nav };

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prevState) => !prevState);
    document.body.classList.toggle('no-scroll', !isOpen);
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
          <li><Link to="#home" onClick={toggleMenu}>Home</Link></li>
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
