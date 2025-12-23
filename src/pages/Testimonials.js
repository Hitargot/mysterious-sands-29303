import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import TestimonialsHeader from '../components/TestimonialsHeader';
import oldReviews from '../data/oldReviews';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const styles = {
    testimonialsPage: {
      background: 'linear-gradient(180deg,#dff0ff 0%, #eaf6ff 100%)',
      minHeight: '100vh',
      boxSizing: 'border-box',
    },
    container: { width: '100%', maxWidth: 1100, margin: '0 auto', padding: isMobile ? 16 : 28, boxSizing: 'border-box' },
    hero: { padding: isMobile ? '28px 0 12px' : '48px 0 20px', textAlign: 'center' },
    h1: { fontSize: isMobile ? 22 : 32, color: '#162660', margin: '0 0 8px' },
    lead: { color: '#6b7280', margin: '0 auto', maxWidth: isMobile ? 360 : 760, fontSize: isMobile ? 14 : 16 },
    loading: { padding: 30, textAlign: 'center', color: '#162660', fontWeight: 600 },
    muted: { color: '#6b7280', textAlign: 'center' },
  reviewsGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit,minmax(240px,1fr))', gap: isMobile ? 12 : 18, marginTop: 18, alignItems: 'start' },
  reviewCard: { background: '#07102a', color: '#f1eae0', padding: isMobile ? 12 : 18, borderRadius: 12, boxShadow: '0 8px 20px rgba(4,6,20,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: isMobile ? 120 : 160, transition: 'transform .22s ease,box-shadow .22s', wordBreak: 'break-word', overflowWrap: 'anywhere' },
    author: { fontWeight: 800, color: '#fff', fontSize: isMobile ? 16 : 18 },
    rating: { color: '#ffd54a', fontSize: isMobile ? 14 : 16 },
  reviewBody: { marginTop: 10, color: '#e8f6ff', fontSize: isMobile ? 14 : 15, lineHeight: 1.5, flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
    reviewMeta: { marginTop: 12, color: '#cbd5e1', fontSize: isMobile ? 12 : 13 },
  };

  return (
    <div style={styles.testimonialsPage}>
      <TestimonialsHeader />

      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.h1}>What our customers say</h1>
          <p style={styles.lead}>Real feedback from users who trusted our services. Honest. Verified. Helpful.</p>
        </div>
      </section>

      <main style={styles.container}>
        {loading ? (
          <div style={styles.loading}>Loading reviews…</div>
        ) : reviews.length === 0 ? (
          <p style={styles.muted}>No reviews yet. Be the first to leave one!</p>
        ) : (
          <div style={styles.reviewsGrid}>
            {reviews.map((review) => (
              <article key={review._id || Math.random()} style={styles.reviewCard}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                  <div style={styles.author}>{review.userId?.username || review.name || 'Anonymous'}</div>
                  <div style={styles.rating}>{'⭐'.repeat(review.rating || 4)}</div>
                </div>

                <div style={styles.reviewBody}>“{review.reviewText || review.review}”</div>

                <div style={styles.reviewMeta}>
                  <div>{review.confirmationId?.serviceId?.name || review.service || 'Service'}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Testimonials;
