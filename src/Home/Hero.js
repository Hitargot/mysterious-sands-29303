import React from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/images/Exo-Hero-Man (2).png';
import '../styles/style.css';
import Header from './Header';

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up in 60 seconds, no KYC hassle.' },
  { num: '02', title: 'Choose Service', desc: 'Gift cards, PayPal, Payoneer, Crypto.' },
  { num: '03', title: 'Send Funds', desc: 'Transfer to our secure company tag.' },
  { num: '04', title: 'Get Paid', desc: 'Naira lands in your bank instantly.' },
];

const stats = [
  { value: '98%', label: 'Completion Rate' },
  { value: '1K+', label: 'Happy Clients' },
  { value: '96%', label: 'Satisfaction' },
  { value: '24/7', label: 'Support' },
];

const Hero = () => (
  <>
    <Header />
    <section id="home" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #060c1a 0%, #0a0f1e 55%, #0d1526 100%)',
      display: 'flex',
      alignItems: 'center',
      paddingTop: 88,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow — gold left */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: '55vw', height: '55vw', maxWidth: 700, maxHeight: 700,
        background: 'radial-gradient(ellipse, rgba(245,166,35,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Background glow — indigo right */}
      <div style={{
        position: 'absolute', bottom: '-5%', right: '-5%',
        width: '40vw', height: '40vw', maxWidth: 500, maxHeight: 500,
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="hero-inner" style={{
        width: '100%',
        maxWidth: 1280,
        margin: '0 auto',
        padding: '60px 5% 100px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '64px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(245,166,35,0.12)',
            border: '1px solid rgba(245,166,35,0.35)',
            color: 'var(--gold)',
            fontSize: 11, fontWeight: 700, letterSpacing: '2.5px',
            textTransform: 'uppercase',
            padding: '6px 16px', borderRadius: 100,
            marginBottom: 28,
          }}>
            <span>&#9889;</span> Nigeria&apos;s #1 Exchange Platform
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.8rem)',
            fontWeight: 900,
            letterSpacing: '-2px',
            lineHeight: 1.05,
            color: '#fff',
            margin: '0 0 22px',
          }}>
            THE FUTURE OF{' '}
            <span style={{ color: 'var(--gold)' }}>SEAMLESS</span>
            {' '}EXCHANGE &amp; INSTANT PAYOUT.
          </h1>

          {/* Sub-copy */}
          <p style={{
            fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)',
            color: 'var(--muted-light)',
            lineHeight: 1.75,
            maxWidth: 500,
            margin: '0 0 40px',
          }}>
            Exchange gift cards, PayPal, Payoneer &amp; crypto for Naira instantly.
            Fast, secure, zero hidden fees &mdash; trusted by thousands.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 56 }}>
            <Link
              to="/signup"
              style={{
                background: 'var(--gold)', color: '#000',
                fontWeight: 800, fontSize: '1rem',
                padding: '14px 36px', borderRadius: 100,
                textDecoration: 'none', display: 'inline-block',
                transition: 'background 180ms, transform 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold-light)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Get Started Free
            </Link>
            <a
              href="#calculator"
              style={{
                background: 'transparent', color: 'var(--text)',
                fontWeight: 700, fontSize: '1rem',
                padding: '14px 36px', borderRadius: 100,
                border: '1px solid var(--navy-border)',
                textDecoration: 'none', display: 'inline-block',
                transition: 'border-color 180ms, color 180ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--muted)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--navy-border)'; e.currentTarget.style.color = 'var(--text)'; }}
            >
              Check Rates &#8594;
            </a>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div style={{
                  fontSize: '1.8rem', fontWeight: 900,
                  color: 'var(--gold)', lineHeight: 1,
                }}>{value}</div>
                <div style={{
                  fontSize: '0.68rem', fontWeight: 700,
                  color: 'var(--muted)', letterSpacing: '1.5px',
                  textTransform: 'uppercase', marginTop: 4,
                }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ position: 'relative', minHeight: 420 }}>
          {/* Hero illustration — centered behind the cards */}
          <img
            src={heroImg}
            alt="Exchange Illustration"
            className="hero-img-float"
          />

          {/* Decorative rings */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%', paddingBottom: '90%',
            borderRadius: '50%',
            border: '1px solid rgba(245,166,35,0.10)',
            pointerEvents: 'none', zIndex: 1,
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '68%', paddingBottom: '68%',
            borderRadius: '50%',
            border: '1px solid rgba(245,166,35,0.06)',
            pointerEvents: 'none', zIndex: 1,
          }} />

          {/* 2x2 Steps grid — sits on top of the image */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            position: 'relative',
            zIndex: 2,
          }}>
            {steps.map(({ num, title, desc }) => (
              <HeroStepCard key={num} num={num} title={title} desc={desc} />
            ))}
          </div>
        </div>
      </div>
    </section>
  </>
);

function HeroStepCard({ num, title, desc }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      style={{
        background: hovered ? 'rgba(26,34,53,0.92)' : 'rgba(26,34,53,0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${hovered ? 'rgba(245,166,35,0.55)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '24px 20px',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'border-color 200ms, transform 200ms, background 200ms',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        fontWeight: 900, fontSize: '0.75rem',
        color: 'var(--gold)', letterSpacing: '1px', marginBottom: 10,
      }}>{num}</div>
      <div style={{
        fontWeight: 800, fontSize: '0.95rem',
        color: '#fff', marginBottom: 8, lineHeight: 1.2,
      }}>{title}</div>
      <div style={{
        fontSize: '0.82rem', color: 'var(--muted-light)', lineHeight: 1.6,
      }}>{desc}</div>
    </div>
  );
}

export default Hero;
