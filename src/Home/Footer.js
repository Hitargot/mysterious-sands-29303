import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

const socials = [
  { href: 'https://t.me/Exdollarium', icon: 'fab fa-telegram-plane', label: 'Telegram' },
  { href: 'https://www.instagram.com/exdollarium/', icon: 'fab fa-instagram', label: 'Instagram' },
  { href: 'https://twitter.com/exdollarium/', icon: 'fab fa-twitter', label: 'X (Twitter)' },
  { href: 'https://www.facebook.com/profile.php?id=61561183927502', icon: 'fab fa-facebook-f', label: 'Facebook' },
];

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#calculator', label: 'Calculator' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
];

const SocialLink = ({ href, icon, label }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        ...s.socialLink,
        background: hovered ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)',
        borderColor: hovered ? 'rgba(245,166,35,0.5)' : 'var(--navy-border)',
        color: hovered ? 'var(--gold)' : 'var(--muted-light)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <i className={icon}></i>
    </a>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={s.footer}>
      {/* Top divider */}
      <div style={s.divider} />

      <div style={s.inner}>
        {/* Brand col */}
        <div style={s.brandCol}>
          <div style={s.logo}>
            <span style={s.logoGold}>Exdoll</span>
            <span style={s.logoWhite}>arium</span>
          </div>
          <p style={s.tagline}>
            Nigeria's trusted P2P currency exchange platform.<br />
            Fast, secure, and transparent.
          </p>
          <div style={s.socialRow}>
            {socials.map((s_) => (
              <SocialLink key={s_.label} {...s_} />
            ))}
          </div>
        </div>

        {/* Nav col */}
        <div style={s.navCol}>
          <h4 style={s.colTitle}>Quick Links</h4>
          <ul style={s.navList}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} style={s.navLink}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact col */}
        <div style={s.navCol}>
          <h4 style={s.colTitle}>Contact</h4>
          <ul style={s.navList}>
            <li style={s.contactItem}>
              <span style={s.contactIcon}>✉️</span>
              <a href="mailto:support@exdollarium.com" style={s.navLink}>support@exdollarium.com</a>
            </li>
            <li style={s.contactItem}>
              <span style={s.contactIcon}>📞</span>
              <a href="tel:+2348139935240" style={s.navLink}>+234 813 993 5240</a>
            </li>
            <li style={s.contactItem}>
              <span style={s.contactIcon}>📍</span>
              <span style={{ color: 'var(--muted-light)', fontSize: '0.875rem' }}>Minna, Niger State, Nigeria</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={s.bottomBar}>
        <p style={s.copyright}>© {currentYear} Exdollarium. All rights reserved.</p>
      </div>
    </footer>
  );
};

const s = {
  footer: {
    background: 'var(--navy-3)',
    borderTop: '1px solid var(--navy-border)',
    paddingTop: 0,
  },
  divider: {
    height: 3,
    background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
    opacity: 0.5,
  },
  inner: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px 32px',
    maxWidth: 1100,
    margin: '0 auto',
    padding: '56px 5% 40px',
  },
  brandCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 900,
    letterSpacing: -0.5,
  },
  logoGold: { color: 'var(--gold)' },
  logoWhite: { color: '#fff' },
  tagline: {
    fontSize: '0.875rem',
    color: 'var(--muted)',
    lineHeight: 1.7,
    margin: 0,
  },
  socialRow: {
    display: 'flex',
    gap: 10,
    marginTop: 4,
  },
  socialLink: {
    width: 38,
    height: 38,
    borderRadius: 10,
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    textDecoration: 'none',
    transition: 'all 200ms',
  },
  navCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  colTitle: {
    fontSize: '0.75rem',
    fontWeight: 800,
    color: 'var(--gold)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    margin: 0,
  },
  navList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  navLink: {
    color: 'var(--muted-light)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    transition: 'color 180ms',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  contactIcon: {
    fontSize: 14,
  },
  bottomBar: {
    borderTop: '1px solid var(--navy-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    padding: '18px 5%',
    maxWidth: '100%',
  },
  copyright: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
    margin: 0,
  },
  disclaimer: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
    margin: 0,
  },
};

export default Footer;