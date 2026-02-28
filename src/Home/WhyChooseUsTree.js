import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FaBolt, FaShieldAlt, FaMoneyBillWave, FaUsers, FaEye, FaCheckCircle } from 'react-icons/fa';

const features = [
  { icon: <FaBolt />,         color: '#F5A623', title: 'Instant Settlement',    desc: 'Naira hits your bank within minutes of admin verification. No overnight waits.' },
  { icon: <FaShieldAlt />,    color: '#3B82F6', title: 'Fraud Protected',       desc: 'Every trade is manually verified before funds are released. Zero chargebacks.' },
  { icon: <FaMoneyBillWave />,color: '#22C55E', title: 'Best Rates',            desc: 'Admin-set live rates updated daily. No hidden fees — the spread is your rate.' },
  { icon: <FaUsers />,        color: '#8B5CF6', title: 'Dedicated Support',     desc: 'Reach us via Telegram, live chat or email. Real humans, real fast responses.' },
  { icon: <FaEye />,          color: '#F97316', title: 'Full Transparency',      desc: 'Track every step of your trade. Receipt generated automatically on completion.' },
  { icon: <FaCheckCircle />,  color: '#06B6D4', title: 'KYC Verified Users',    desc: 'Every account is KYC-verified. No anonymous transactions — full accountability.' },
];

const WhyChooseUsTree = () => {
  const cardsRef = useRef([]);

  useEffect(() => {
    if (cardsRef.current.length) {
      gsap.to(cardsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      });
    }
  }, []);

  return (
    <section style={s.section}>
      <div style={s.inner}>
        <div style={s.header}>
          <span style={s.tag}>Why Choose Us</span>
          <h2 style={s.heading}>Built different.<br />On purpose.</h2>
          <p style={s.lead}>We made deliberate choices that other platforms skip — because trust is the product.</p>
        </div>

        <div style={s.grid}>
          {features.map(({ icon, color, title, desc }, i) => (
            <div
              key={title}
              ref={el => cardsRef.current[i] = el}
              style={{ ...s.card, opacity: 0, transform: 'translateY(20px)' }}
            >
              <div style={{ ...s.iconCircle, background: `${color}18`, border: `1px solid ${color}30` }}>
                <span style={{ color, fontSize: 20 }}>{icon}</span>
              </div>
              <div>
                <h3 style={s.cardTitle}>{title}</h3>
                <p style={s.cardDesc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const s = {
  section: { padding: '88px 5%', background: 'var(--navy-2)' },
  inner:  { maxWidth: 1100, margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: 48 },
  tag: {
    display: 'inline-block',
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.3)',
    color: '#4ADE80',
    fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
    padding: '5px 14px', borderRadius: 100, marginBottom: 16,
  },
  heading: {
    fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800,
    letterSpacing: -0.8, lineHeight: 1.15, color: '#fff', marginBottom: 12,
  },
  lead: { fontSize: '1.05rem', color: '#94A3B8', lineHeight: 1.7 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
  },
  card: {
    background: 'var(--navy-card)',
    border: '1px solid var(--navy-border)',
    borderRadius: 16,
    padding: '24px 22px',
    display: 'flex',
    gap: 18,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: { fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 6 },
  cardDesc:  { fontSize: '0.875rem', color: '#64748B', lineHeight: 1.6 },
};

export default WhyChooseUsTree;
