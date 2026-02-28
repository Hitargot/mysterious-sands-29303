import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/IMG_940.PNG';

export default function TestimonialsHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(prev => {
      const next = !prev;
      document.body.style.overflow = next ? 'hidden' : '';
      return next;
    });
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = '';
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/#about' },
    { label: 'Services', to: '/#services' },
    { label: 'FAQ', to: '/#faq' },
    { label: 'Contact', to: '/#contact' },
  ];

  const s = {
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      height: '70px',
      background: scrolled ? 'rgba(10,15,30,0.95)' : 'rgba(10,15,30,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(245,166,35,0.12)',
      transition: 'all 0.3s ease',
      boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
    },
    logoWrap: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      cursor: 'pointer',
    },
    logoImg: {
      height: '44px',
      width: 'auto',
      objectFit: 'contain',
    },
    logoText: {
      fontSize: '1.15rem',
      fontWeight: 700,
      letterSpacing: '0.06em',
      color: '#F5A623',
    },
    desktopNav: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.8rem',
    },
    navLink: {
      color: '#E2E8F0',
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: 500,
      letterSpacing: '0.03em',
      transition: 'color 0.2s',
    },
    loginBtn: {
      background: 'linear-gradient(135deg, #F5A623, #FBBF24)',
      color: '#0A0F1E',
      border: 'none',
      borderRadius: '50px',
      padding: '0.45rem 1.2rem',
      fontSize: '0.88rem',
      fontWeight: 700,
      cursor: 'pointer',
      letterSpacing: '0.04em',
      transition: 'opacity 0.2s',
    },
    overlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 1150,
      background: 'rgba(10,15,30,0.97)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem',
    },
    mobileLink: {
      color: '#E2E8F0',
      textDecoration: 'none',
      fontSize: '1.4rem',
      fontWeight: 600,
      letterSpacing: '0.04em',
    },
    closeBtn: {
      position: 'absolute',
      top: '1.5rem',
      right: '1.5rem',
      background: 'none',
      border: 'none',
      color: '#F5A623',
      fontSize: '1.8rem',
      cursor: 'pointer',
      lineHeight: 1,
    },
  };

  return (
    <>
      <header style={s.header}>
        {/* Logo */}
        <div style={s.logoWrap} onClick={() => navigate('/')}>
          <img src={logo} alt="Exdollarium" style={s.logoImg} />
          <span style={s.logoText}>EXDOLLARIUM</span>
        </div>

        {/* Desktop nav */}
        <nav style={{ ...s.desktopNav, display: isMobile ? 'none' : 'flex' }} className="desktop-only-nav">
          {navLinks.map(l => (
            <Link
              key={l.label}
              to={l.to}
              style={s.navLink}
              onMouseEnter={e => (e.target.style.color = '#F5A623')}
              onMouseLeave={e => (e.target.style.color = '#E2E8F0')}
            >
              {l.label}
            </Link>
          ))}
          <button
            style={s.loginBtn}
            onClick={() => navigate('/login')}
            onMouseEnter={e => (e.target.style.opacity = '0.85')}
            onMouseLeave={e => (e.target.style.opacity = '1')}
          >
            Login
          </button>
        </nav>

        {/* Hamburger (mobile only) */}
        <button
          className="mobile-hamburger"
          onClick={toggleMenu}
          aria-label="Open menu"
          style={{
            display: isMobile ? 'flex' : 'none',
            flexDirection: 'column',
            gap: '5px',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: '4px',
          }}
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                width: '24px',
                height: '2px',
                background: '#F5A623',
                borderRadius: '2px',
                display: 'block',
              }}
            />
          ))}
        </button>
      </header>

      {/* Mobile overlay */}
      {isOpen && (
        <div style={s.overlay}>
          <button style={s.closeBtn} onClick={closeMenu} aria-label="Close menu">✕</button>
          {navLinks.map(l => (
            <Link key={l.label} to={l.to} style={s.mobileLink} onClick={closeMenu}>
              {l.label}
            </Link>
          ))}
          <button
            style={{ ...s.loginBtn, fontSize: '1rem', padding: '0.6rem 2rem' }}
            onClick={() => { closeMenu(); navigate('/login'); }}
          >
            Login
          </button>
        </div>
      )}

      <div style={{ height: '70px' }} aria-hidden="true" />
    </>
  );
}
