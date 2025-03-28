import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/images/Exodollarium-01.png';

// Styled components
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
    display: block;
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

    .close-icon {
      position: absolute;
      top: 15px;
      right: 100px;
      font-size: 30px;
      cursor: pointer;
      color: #fff;
      display: none;
    }

    ul.open .close-icon {
      display: block;
    }

    body.no-scroll {
      overflow: hidden;
    }
  }
`;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      {isMobile && <MenuIcon onClick={toggleMenu}>☰</MenuIcon>}
      <Nav>
        <ul className={isOpen ? 'open' : ''}>
          <li><a href="#home" onClick={toggleMenu}>Home</a></li>
          <li><a href="#about" onClick={toggleMenu}>About Us</a></li>
          <li><a href="#services" onClick={toggleMenu}>Services</a></li>
          <li><Link to="/testimonials" onClick={toggleMenu}>Testimonials</Link></li>
          <li><a href="#faq" onClick={toggleMenu}>FAQ</a></li>
          <li><a href="#contact" onClick={toggleMenu}>Contact Us</a></li>
          {isMobile && <li className="close-icon" onClick={toggleMenu}>✖</li>}
        </ul>
      </Nav>
    </HeaderContainer>
  );
}
