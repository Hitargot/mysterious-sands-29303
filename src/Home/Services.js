import React from 'react';
import { useNavigate } from 'react-router-dom';
import paypalIcon   from '../assets/images/path_to_paypal_icon.png';
import cryptoIcon   from '../assets/images/path_to_crypto_icon.png';
import payoneerIcon from '../assets/images/path_to_payonee.png';
import fiverrIcon   from '../assets/images/path_to_fiverr.png';
import usBankIcon   from '../assets/images/path_to_us_bank_icon.png';
import upworkIcon   from '../assets/images/path_to_upwork_icon.png';
import websiteIcon  from '../assets/images/path_to_website_recharge_icon.png';
import cardIcon     from '../assets/images/2019-01-30-gift-cards.jpeg';

const services = [
  { name: 'PayPal Exchange',   icon: paypalIcon,   desc: 'Convert PayPal balances to Naira quickly with competitive rates.' },
  { name: 'Crypto Exchange',   icon: cryptoIcon,   desc: 'Buy/sell BTC, USDT, ETH and more with instant NGN settlement.' },
  { name: 'Gift Card Redeem',  icon: cardIcon,     desc: 'Redeem Steam, Apple, iTunes and other gift cards for cash.' },
  { name: 'Payoneer Exchange', icon: payoneerIcon, desc: 'Withdraw Payoneer balances to your local Nigerian account easily.' },
  { name: 'Fiverr Withdrawal', icon: fiverrIcon,   desc: 'Get paid from Fiverr and convert earnings to Naira or bank transfers.' },
  { name: 'US Bank Transfer',  icon: usBankIcon,   desc: 'Receive USD payouts directly to your US bank account seamlessly.' },
  { name: 'Upwork Withdrawal', icon: upworkIcon,   desc: 'Withdraw your Upwork earnings fast and securely at best rates.' },
  { name: 'Website Recharge',  icon: websiteIcon,  desc: 'Top-up websites and services using smscode and pivapin methods.' },
];

const Services = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = React.useState(null);

  const scrollToCalc = () => {
    const el = document.getElementById('calculator');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else navigate('/services');
  };

  return (
    <section id="services" style={s.section}>
      <div style={s.header}>
        <span style={s.tag}>SERVICES</span>
        <h2 style={s.heading}>
          What We <span style={{ color: 'var(--gold)' }}>Exchange</span>
        </h2>
        <p style={s.lead}>
          From PayPal to crypto &mdash; we handle it all with competitive rates and fast payouts.
        </p>
      </div>

      <div style={s.grid}>
        {services.map((svc, i) => (
          <div
            key={svc.name}
            style={{
              ...s.card,
              borderColor: hovered === i ? 'rgba(245,166,35,0.5)' : 'var(--navy-border)',
              transform: hovered === i ? 'translateY(-4px)' : 'none',
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={s.iconWrap}>
              <img src={svc.icon} alt={svc.name} style={s.iconImg} />
            </div>
            <h3 style={s.cardTitle}>{svc.name}</h3>
            <p style={s.cardDesc}>{svc.desc}</p>
            <button onClick={scrollToCalc} style={s.cardBtn}>Check Rate &rarr;</button>
          </div>
        ))}
      </div>
    </section>
  );
};

const s = {
  section: { padding: '88px 5%', background: 'var(--navy)' },
  header: { textAlign: 'center', maxWidth: 580, margin: '0 auto 52px' },
  tag: {
    display: 'inline-block',
    background: 'rgba(245,166,35,0.12)',
    border: '1px solid rgba(245,166,35,0.3)',
    color: 'var(--gold)',
    fontSize: 11, fontWeight: 700, letterSpacing: '2px',
    textTransform: 'uppercase',
    padding: '5px 14px', borderRadius: 100, marginBottom: 16,
  },
  heading: {
    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
    fontWeight: 800, color: '#fff',
    letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 12,
  },
  lead: { fontSize: '1rem', color: 'var(--muted-light)', lineHeight: 1.7 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 20,
    maxWidth: 1100,
    margin: '0 auto',
  },
  card: {
    background: 'var(--navy-card)',
    border: '1px solid',
    borderRadius: 16,
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'border-color 200ms, transform 200ms',
  },
  iconWrap: {
    width: 60,
    height: 60,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: 10,
  },
  iconImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  },
  cardTitle: { fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 },
  cardDesc: {
    fontSize: '0.875rem',
    color: 'var(--muted-light)',
    lineHeight: 1.6,
    flex: 1,
    margin: 0,
  },
  cardBtn: {
    marginTop: 8,
    background: 'transparent',
    border: '1px solid rgba(245,166,35,0.3)',
    color: 'var(--gold)',
    padding: '8px 14px',
    borderRadius: 100,
    fontWeight: 700,
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'background 180ms',
    alignSelf: 'flex-start',
  },
};

export default Services;
