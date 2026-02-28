import React from 'react';
import image1 from '../assets/images/949shots_so.png';
import image2 from '../assets/images/969shots_so.png';
import image3 from '../assets/images/856shots_so.png';

const stats = [
  { num: '1K+',  label: 'Transactions completed' },
  { num: '98%',  label: 'Completion rate'         },
  { num: '5 min', label: 'Average payout time'   },
  { num: '24/7', label: 'Admin availability'      },
];

const About = () => (
  <section id="about" style={s.section}>
    <div style={s.inner}>
      {/* Images column */}
      <div style={s.imagesCol}>
        <img src={image1} alt="App screenshot 1" style={{ ...s.img, marginTop: 0    }} />
        <img src={image2} alt="App screenshot 2" style={{ ...s.img, marginTop: -60  }} />
        <img src={image3} alt="App screenshot 3" style={{ ...s.img, marginTop: -60  }} />
      </div>

      {/* Text column */}
      <div style={s.textCol}>
        <span style={s.tag}>About Us</span>
        <h2 style={s.heading}>We are the trusted middleman for Nigerian forex.</h2>
        <p style={s.lead}>
          Exdollarium is a human-verified P2P forex desk. We sit between you and the foreign payment platform —
          verifying every transaction before a single Naira moves. No black market risk. No chargebacks. Just trust.
        </p>
        <p style={s.body}>
          Founded to solve the daily struggle of converting PayPal, Payoneer, gift cards and crypto to Naira
          at a fair rate, without the fear that comes with unverified traders.
        </p>

        <div style={s.statsGrid}>
          {stats.map(({ num, label }) => (
            <div key={label} style={s.statCard}>
              <span style={s.statNum}>{num}</span>
              <span style={s.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const s = {
  section: {
    padding: '88px 5%',
    background: 'var(--navy-2)',
  },
  inner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    gap: 64,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  imagesCol: {
    flex: '0 0 auto',
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  img: {
    width: 140,
    borderRadius: 16,
    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
    objectFit: 'cover',
  },
  textCol: {
    flex: 1,
    minWidth: 280,
  },
  tag: {
    display: 'inline-block',
    background: 'rgba(245,166,35,0.12)',
    border: '1px solid rgba(245,166,35,0.3)',
    color: 'var(--gold)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    padding: '5px 14px',
    borderRadius: 100,
    marginBottom: 18,
  },
  heading: {
    fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
    fontWeight: 800,
    letterSpacing: -0.8,
    lineHeight: 1.15,
    color: '#fff',
    marginBottom: 16,
  },
  lead: {
    fontSize: '1.05rem',
    color: '#94A3B8',
    lineHeight: 1.7,
    marginBottom: 12,
  },
  body: {
    fontSize: '0.95rem',
    color: '#64748B',
    lineHeight: 1.7,
    marginBottom: 32,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
  },
  statCard: {
    background: 'var(--navy-card)',
    border: '1px solid var(--navy-border)',
    borderRadius: 12,
    padding: '18px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statNum: {
    fontSize: '1.6rem',
    fontWeight: 900,
    color: 'var(--gold)',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#64748B',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
};

export default About;
