import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import exoLogo from '../assets/images/Exo-logo.png';
import '../styles/style.css';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupClosing, setSignupClosing] = useState(false);
  const timerRef = useRef(null);

  const toggle = () => {
    setOpen((v) => !v);
    // toggle body no-scroll when opening/closing mobile nav
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('no-scroll', !open);
    }
  };

  const openSignup = () => {
    setSignupClosing(false);
    setSignupOpen(true);
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('no-scroll', true);
    }
  };

  const closeSignup = () => {
    // start closing animation, then unmount after the animation finishes
    setSignupClosing(true);
    // keep no-scroll until animation finishes
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('no-scroll', true);
    }
    // clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setSignupOpen(false);
      setSignupClosing(false);
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('no-scroll', false);
      }
      timerRef.current = null;
    }, 220); // match CSS animation duration
  };

  useEffect(() => {
    return () => {
  if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <img src={exoLogo} alt="Logo" className="logo-img" />
          <p className="company-name">Exdollarium</p>
        </div>
      </div>

      <div className="header-right">
        {/* menu toggle for mobile */}
        <button className={ 'menu-toggle' + (open ? ' active' : '') } aria-label="Toggle navigation" onClick={toggle}>
          <span className="hamburger" />
        </button>

  {/* Primary action: LOGIN (placed where 'Create an account' used to be). Opens the modal. */}
  <button type="button" className="action-btn signup-btn" onClick={() => { setOpen(false); openSignup(); }}>LOGIN</button>

        <nav className="cta">
          <div className={ 'menu-backdrop' + (open ? ' active' : '') } onClick={toggle}></div>
          <ul className={ 'cta-nav-list' + (open ? ' active' : '') }>
            {/* MOBILE LOGIN and SIGNUP first for prominence on small screens */}
            <li className="mobile-only"><button className="mobile-login-btn" onClick={() => { setOpen(false); openSignup(); }}>LOGIN</button></li>
            <li className="mobile-only"><Link to="/signup" className="mobile-signup-btn" onClick={() => setOpen(false)}>CREATE AN ACCOUNT</Link></li>
            <li><a href="#home" onClick={() => setOpen(false)}>HOME</a></li>
            <li><a href="#about" onClick={() => setOpen(false)}>ABOUT US</a></li>
            <li><a href="#services" onClick={() => setOpen(false)}>SERVICES</a></li>
            <li><Link to="/testimonials" onClick={() => setOpen(false)}>TESTIMONIALS</Link></li>
            <li><a href="#faq" onClick={() => setOpen(false)}>FAQ</a></li>
            <li><a href="#contact" onClick={() => setOpen(false)}>CONTACT US</a></li>
          </ul>
        </nav>
        {signupOpen && (
          <>
            <div className={ 'modal-backdrop' + (signupOpen ? ' active' : '') + (signupClosing ? ' closing' : '') } onClick={closeSignup}></div>
            <div className={ 'signup-modal' + (signupClosing ? ' closing' : '') } role="dialog" aria-modal="true" aria-labelledby="signup-title">
              <button className="modal-close" onClick={closeSignup} aria-label="Close">×</button>
              <h2 id="signup-title">Create an account</h2>
              <div className="signup-form">
                <Link to="/signup" className="action-btn signup-btn" onClick={closeSignup}>Create an account</Link>
              </div>
              <p className="modal-footer">Already had an account? <Link to="/login" onClick={closeSignup}>LOGIN</Link></p>
            </div>
          </>
        )}
      </div>
    </header>
  );
}