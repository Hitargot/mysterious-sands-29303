import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import TestimonialsHeader from '../components/TestimonialsHeader';
import oldReviews from '../data/oldReviews';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchApprovedReviews = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/approved`);
      setReviews([...response.data, ...oldReviews]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([...oldReviews]);
    }
    setLoading(false);
  }, [apiUrl]);

  useEffect(() => {
    fetchApprovedReviews();
  }, [fetchApprovedReviews]);

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const renderStars = (rating = 4) => {
    const n = Math.min(5, Math.max(1, rating));
    return Array.from({ length: n }, (_, i) => (
      <span key={i} style={{ color: '#F5A623', fontSize: isMobile ? 14 : 16 }}>★</span>
    ));
  };

  const getInitial = (name) =>
    (name || 'A').trim().charAt(0).toUpperCase();

  const s = {
    page: {
      background: 'linear-gradient(180deg, #0A0F1E 0%, #0F172A 100%)',
      minHeight: '100vh',
      boxSizing: 'border-box',
    },
    /* ── Hero banner ── */
    heroBanner: {
      position: 'relative',
      overflow: 'hidden',
      padding: isMobile ? '48px 20px 36px' : '72px 20px 52px',
      textAlign: 'center',
    },
    glowLeft: {
      position: 'absolute',
      top: '-80px',
      left: '-80px',
      width: '340px',
      height: '340px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    glowRight: {
      position: 'absolute',
      bottom: '-60px',
      right: '-60px',
      width: '260px',
      height: '260px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    badge: {
      display: 'inline-block',
      background: 'rgba(245,166,35,0.12)',
      border: '1px solid rgba(245,166,35,0.35)',
      color: '#F5A623',
      borderRadius: '50px',
      padding: '0.35rem 1rem',
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      marginBottom: '1rem',
    },
    heroTitle: {
      fontSize: isMobile ? '1.7rem' : '2.6rem',
      fontWeight: 800,
      color: '#E2E8F0',
      margin: '0 0 0.8rem',
      lineHeight: 1.2,
    },
    heroTitleGold: {
      color: '#F5A623',
    },
    heroSub: {
      color: '#94A3B8',
      fontSize: isMobile ? '0.95rem' : '1.05rem',
      maxWidth: 560,
      margin: '0 auto',
      lineHeight: 1.7,
    },
    divider: {
      width: 60,
      height: 3,
      background: 'linear-gradient(90deg, #F5A623, #FBBF24)',
      borderRadius: 2,
      margin: '1.4rem auto 0',
    },
    /* ── Grid ── */
    container: {
      width: '100%',
      maxWidth: 1140,
      margin: '0 auto',
      padding: isMobile ? '20px 16px 48px' : '28px 24px 64px',
      boxSizing: 'border-box',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: isMobile ? 16 : 22,
      alignItems: 'start',
    },
    /* ── Card ── */
    card: (id) => ({
      background: hoveredCard === id
        ? 'rgba(30,41,60,0.95)'
        : 'rgba(26,34,53,0.85)',
      border: hoveredCard === id
        ? '1px solid rgba(245,166,35,0.45)'
        : '1px solid rgba(30,41,59,0.9)',
      borderRadius: 16,
      padding: isMobile ? 18 : 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      boxShadow: hoveredCard === id
        ? '0 12px 32px rgba(0,0,0,0.45)'
        : '0 4px 16px rgba(0,0,0,0.3)',
      transition: 'all 0.25s ease',
      transform: hoveredCard === id ? 'translateY(-4px)' : 'none',
      wordBreak: 'break-word',
      overflowWrap: 'anywhere',
      cursor: 'default',
    }),
    cardTop: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #F5A623, #FBBF24)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.1rem',
      fontWeight: 800,
      color: '#0A0F1E',
      flexShrink: 0,
    },
    authorName: {
      fontWeight: 700,
      color: '#E2E8F0',
      fontSize: isMobile ? '0.95rem' : '1rem',
      lineHeight: 1.2,
    },
    starsRow: {
      display: 'flex',
      gap: 2,
      marginTop: 2,
    },
    quoteIcon: {
      color: 'rgba(245,166,35,0.25)',
      fontSize: '2rem',
      lineHeight: 1,
      marginBottom: -6,
      fontFamily: 'Georgia, serif',
    },
    reviewBody: {
      color: '#CBD5E1',
      fontSize: isMobile ? '0.88rem' : '0.95rem',
      lineHeight: 1.7,
      flex: 1,
    },
    servicePill: {
      display: 'inline-block',
      background: 'rgba(245,166,35,0.1)',
      border: '1px solid rgba(245,166,35,0.25)',
      color: '#F5A623',
      borderRadius: 50,
      padding: '0.22rem 0.75rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.04em',
    },
    /* ── States ── */
    loading: {
      padding: 48,
      textAlign: 'center',
      color: '#94A3B8',
      fontSize: '1rem',
    },
    loadingDot: {
      display: 'inline-block',
      width: 40,
      height: 40,
      borderRadius: '50%',
      border: '3px solid rgba(245,166,35,0.15)',
      borderTop: '3px solid #F5A623',
      animation: 'spin 0.9s linear infinite',
      marginBottom: 16,
    },
    empty: {
      padding: 48,
      textAlign: 'center',
      color: '#64748B',
      fontSize: '1rem',
    },
  };

  return (
    <div style={s.page}>
      <TestimonialsHeader />

      {/* Hero */}
      <section style={s.heroBanner}>
        <div style={s.glowLeft} />
        <div style={s.glowRight} />
        <div style={s.badge}>⭐ Customer Reviews</div>
        <h1 style={s.heroTitle}>
          What Our <span style={s.heroTitleGold}>Customers Say</span>
        </h1>
        <p style={s.heroSub}>
          Real feedback from verified users who trusted our platform.
          Honest, transparent, and straight from the community.
        </p>
        <div style={s.divider} />
      </section>

      {/* Reviews grid */}
      <main style={s.container}>
        {loading ? (
          <div style={s.loading}>
            <div style={s.loadingDot} />
            <p>Loading reviews…</p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={s.empty}>No reviews yet. Be the first to leave one!</div>
        ) : (
          <div style={s.grid}>
            {reviews.map((review, idx) => {
              const id = review._id || idx;
              const name = review.userId?.username || review.name || 'Anonymous';
              const body = review.reviewText || review.review || '';
              const service =
                review.confirmationId?.serviceId?.name || review.service || 'Service';
              return (
                <article
                  key={id}
                  style={s.card(id)}
                  onMouseEnter={() => setHoveredCard(id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Author row */}
                  <div style={s.cardTop}>
                    <div style={s.avatar}>{getInitial(name)}</div>
                    <div>
                      <div style={s.authorName}>{name}</div>
                      <div style={s.starsRow}>{renderStars(review.rating)}</div>
                    </div>
                  </div>

                  {/* Quote mark */}
                  <div style={s.quoteIcon}>"</div>

                  {/* Body */}
                  <p style={s.reviewBody}>{body}</p>

                  {/* Service pill */}
                  <div>
                    <span style={s.servicePill}>{service}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Testimonials;
