import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/images/IMG_940.PNG';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #162660;
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

  span {
    font-size: 20px;
    color: #d0e6fd;
    font-weight: bold;
    margin-left: 12px;
  }

  @media (max-width: 768px) {
    img { height: 64px; }
    span { font-size: 16px; }
  }
`;

const MenuIcon = styled.button`
  display: none;
  font-size: 1.6rem;
  color: #f1e4d1;
  cursor: pointer;
  padding: 8px 10px;
  background: transparent;
  border: none;
  line-height: 1;

  @media (max-width: 768px) { display: block; }
`;

const CloseButton = styled.button`
  position: fixed; /* ensure it floats above the overlay */
  top: 14px;
  right: 24px;
  font-size: 28px;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  z-index: 9999; /* very high so it isn't blocked */

  @media (min-width: 769px) { display: none; }

  &:focus { outline: 2px solid #d0e6fd; outline-offset: 2px; }
`;

// left close button removed — keep a single close button at top-right for mobile

const Nav = styled.nav`
  ul {
    display: flex;
    list-style: none;
    align-items: center;
    gap: 18px;
    margin: 0;
    padding: 0;

    li { margin: 0; }

    a {
      color: #f1e4d1;
      text-decoration: none;
      padding: 8px 10px;
      border-radius: 6px;
      transition: all 0.18s ease-in-out;
      font-weight: 600;
      font-size: 16px;
    }

    a:hover { color: #ffffff; transform: translateY(-1px); }
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
      transform: translateY(-100%);
      transition: transform 0.36s cubic-bezier(.2,.9,.3,1);
      opacity: 0;
      padding: 40px 20px;
      z-index: 1100;
    }

    ul.open { transform: translateY(0); opacity: 1; }

    li { margin: 14px 0; font-size: 22px; }
  }
`;

export default function TestimonialsHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
    document.body.classList.toggle('no-scroll', !isOpen);
  };

  const headerHeight = isMobile ? '64px' : '96px';

  return (
    <>
      <HeaderContainer style={{ height: headerHeight }}>
        <Logo>
          <img src={logo} alt="Exdollarium logo" />
          <span>EXDOLLARIUM</span>
        </Logo>

        {/* show hamburger when menu is closed; when open we use the fixed close buttons */}
        {!isOpen && (
          <MenuIcon aria-controls="testimonial-navigation" aria-expanded={isOpen} onClick={toggleMenu} aria-label={'Open menu'}>
            {'☰'}
          </MenuIcon>
        )}

        <Nav>
          <ul id="testimonial-navigation" className={isOpen ? 'open' : ''}>
            <li><a href="/">Home</a></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </Nav>
        {isMobile && isOpen && (
          <CloseButton onClick={toggleMenu} aria-label="Close menu">✖</CloseButton>
        )}
      </HeaderContainer>
      <div style={{ height: headerHeight }} aria-hidden="true" />
    </>
  );
}
