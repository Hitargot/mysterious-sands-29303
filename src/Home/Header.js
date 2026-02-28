import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import exoLogo from '../assets/images/Exo-logo.png';
import '../styles/style.css';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupClosing, setSignupClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  const closeNav = () => {
    setOpen(false);
    document.body.style.overflow = '';
  };

  const openSignup = () => {
    setSignupClosing(false);
    setSignupOpen(true);
  };

  const closeSignup = () => {
    setSignupClosing(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setSignupOpen(false);
      setSignupClosing(false);
      timerRef.current = null;
    }, 220);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const navLinks = [
    { label: 'Home',         href: '#home'      },
    { label: 'About',        href: '#about'      },
    { label: 'Services',     href: '#services'   },
    { label: 'Testimonials', to:   '/testimonials'},
    { label: 'FAQ',          href: '#faq'        },
    { label: 'Contact',      href: '#contact'    },
  ];

  return (
    <header className="header" style={scrolled ? { boxShadow: '0 4px 24px rgba(0,0,0,0.4)' } : {}}>
      {/* Logo */}
      <div className="header-left">
        <div className="logo">
          <img src={exoLogo} alt="Exdollarium Logo" className="logo-img" />
          <span className="company-name">Exdollarium</span>
        </div>
      </div>

      {/* Desktop nav + CTA */}
      <div className="header-right">
        <nav>
          <ul className="cta-nav-list" style={{ display: 'flex', listStyle: 'none', gap: '1.8rem', margin: 0, padding: 0 }}>
            {navLinks.map(({ label, href, to }) => (
              <li key={label} style={{ display: 'none' }} className="desktop-nav-item">
                {to
                  ? <Link to={to} style={{ textDecoration: 'none', color: 'var(--muted-light)', fontWeight: 600, fontSize: '0.875rem', transition: 'color 180ms' }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = 'var(--muted-light)'}
                    >{label}</Link>
                  : <a href={href} style={{ textDecoration: 'none', color: 'var(--muted-light)', fontWeight: 600, fontSize: '0.875rem', transition: 'color 180ms' }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = 'var(--muted-light)'}
                    >{label}</a>
                }
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop nav inline */}
        <nav style={{ display: 'flex', gap: '1.8rem' }} className="desktop-only-nav">
          {navLinks.map(({ label, href, to }) => (
            to
              ? <Link key={label} to={to} style={navStyle} onMouseEnter={e => e.currentTarget.style.color='#fff'} onMouseLeave={e => e.currentTarget.style.color='var(--muted-light)'}>{label}</Link>
              : <a   key={label} href={href} style={navStyle} onMouseEnter={e => e.currentTarget.style.color='#fff'} onMouseLeave={e => e.currentTarget.style.color='var(--muted-light)'}>{label}</a>
          ))}
        </nav>

        <button className="action-btn signup-btn" onClick={openSignup}>Login</button>

        {/* Hamburger */}
        <button className={`menu-toggle${open ? ' active' : ''}`} aria-label="Toggle navigation" onClick={toggle}>
          <span className="hamburger" />
        </button>
      </div>

      {/* Mobile nav drawer */}
      <div className={`menu-backdrop${open ? ' active' : ''}`} onClick={closeNav} />
      <ul className={`cta-nav-list mobile-nav-list${open ? ' active' : ''}`}>
        <li><Link to="/login"  className="mobile-login-btn"  onClick={closeNav}>Login</Link></li>
        <li><Link to="/signup" className="mobile-signup-btn" onClick={closeNav}>Create Account</Link></li>
        {navLinks.map(({ label, href, to }) => (
          <li key={label}>
            {to
              ? <Link to={to} style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }} onClick={closeNav}>{label}</Link>
              : <a   href={href} style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }} onClick={closeNav}>{label}</a>
            }
          </li>
        ))}
      </ul>

      {/* Login/Signup modal */}
      {signupOpen && (
        <>
          <div className={`modal-backdrop active${signupClosing ? ' closing' : ''}`} onClick={closeSignup} />
          <div className={`signup-modal${signupClosing ? ' closing' : ''}`} role="dialog" aria-modal="true">
            <button className="modal-close" onClick={closeSignup} aria-label="Close">×</button>
            <h2>Welcome back 👋</h2>
            <div className="signup-form">
              <Link to="/login"  className="action-btn" style={{ background: 'var(--gold)', color: '#000' }} onClick={closeSignup}>Login</Link>
              <Link to="/signup" className="action-btn" style={{ background: 'transparent', border: '1px solid var(--navy-border)', color: 'var(--text)' }} onClick={closeSignup}>Create Account</Link>
            </div>
            <p className="modal-footer">New to Exdollarium? <Link to="/signup" onClick={closeSignup} style={{ color: 'var(--gold)' }}>Sign up free →</Link></p>
          </div>
        </>
      )}
    </header>
  );
}

const navStyle = {
  textDecoration: 'none',
  color: 'var(--muted-light)',
  fontWeight: 600,
  fontSize: '0.875rem',
  transition: 'color 180ms ease',
};
