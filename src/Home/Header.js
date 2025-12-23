import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/images/IMG_940.PNG';

// Styled components
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #162660; /* Deep Navy Blue */
  padding: 0 20px 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1100;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;

  img {
    height: 96px;
    width: auto;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    img {
      height: 64px;
    }

    span {
      font-size: 16px;
    }
  }

  span {
    font-size: 20px;
    color: #d0e6fd; /* Light Sky Blue */
    font-weight: bold;
    margin-right: 24px; /* space between logo text and nav/home button */
  }
`;

const MenuIcon = styled.button`
  display: none;
  font-size: 1.6rem;
  color: #f1e4d1; /* Soft Beige */
  cursor: pointer;
  padding: 8px 10px;
  background: transparent;
  border: none;
  line-height: 1;

  @media (max-width: 768px) {
    display: block;
  }

  &:focus {
    outline: 2px solid #d0e6fd;
    outline-offset: 2px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 100px;
  font-size: 28px;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  z-index: 1201; /* above the overlay */

  @media (min-width: 769px) {
    display: none;
  }

  &:focus {
    outline: 2px solid #d0e6fd;
    outline-offset: 2px;
  }
`;

const Nav = styled.nav`
  ul {
    display: flex;
    list-style: none;
    align-items: center;
    gap: 18px;
    margin: 0;

    li {
      margin: 0;
    }

    a {
      color: #f1e4d1;
      text-decoration: none;
      padding: 8px 10px;
      border-radius: 6px;
      transition: all 0.18s ease-in-out;
      font-weight: 600;
      font-size: 16px;
    }

    a:hover {
      color: #ffffff; /* white text on brand background for contrast */
      background: #162660; /* brand background on hover */
      transform: translateY(-1px);
    }

    .cta {
      background: #ff7a00;
      color: #fff;
      padding: 8px 14px;
      border-radius: 999px;
      font-weight: 700;
      box-shadow: 0 6px 18px rgba(255,122,0,0.18);
    }

    .cta:hover {
      filter: brightness(0.95);
      transform: translateY(-1px);
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
      background-color: rgba(22, 38, 96, 0.98);
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translateY(-100%);
      transition: transform 0.36s cubic-bezier(.2,.9,.3,1), opacity 0.2s ease-in-out;
      opacity: 0;
      padding: 40px 20px;
      z-index: 1100;
    }

    ul.open {
      transform: translateY(0);
      opacity: 1;
    }

    li {
      margin: 14px 0;
      font-size: 22px;
    }

    .close-icon {
      position: absolute;
      top: 18px;
      right: 18px;
      font-size: 28px;
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
  // Reduced default header height to avoid oversized header on large screens
  const headerHeight = isMobile ? '64px' : '96px';

  return (
    <>
    <HeaderContainer style={{ height: headerHeight }}>
      <Logo>
        <img src={logo} alt="Exdollarium logo" />
        <span>EXDOLLARIUM</span>
      </Logo>

      {/* Accessible menu button for mobile */}
      <MenuIcon
        aria-controls="main-navigation"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? '✖' : '☰'}
      </MenuIcon>

      <Nav>
        <ul id="main-navigation" className={isOpen ? 'open' : ''}>
          <li><a href="#home" onClick={toggleMenu}>Home</a></li>
          <li><a href="#about" onClick={toggleMenu}>About Us</a></li>
          <li><a href="#services" onClick={toggleMenu}>Services</a></li>
          <li><Link to="/testimonials" onClick={toggleMenu}>Testimonials</Link></li>
          <li><a href="#faq" onClick={toggleMenu}>FAQ</a></li>
          <li><a href="#contact" onClick={toggleMenu} className="cta">Talk to Sales</a></li>
          {isMobile && isOpen && (
            <CloseButton onClick={toggleMenu} aria-label="Close menu">✖</CloseButton>
          )}
        </ul>
      </Nav>
    </HeaderContainer>
    {/* spacer so fixed header doesn't cover page content */}
    <div style={{ height: headerHeight }} aria-hidden="true" />
    </>
  );
}