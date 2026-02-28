import { useEffect, useState } from "react";
import React from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Hero from "./Hero";
import About from "./About";
import Services from "./Services";
import WhyChooseUsTree from "./WhyChooseUsTree";
import Calculator from "./Calculator";
import FAQ from "./FAQ";
import Contact from "./Contact";
import Footer from "./Footer";
import FloatingBackground from "./FloatingBackground";
import { useInView } from "react-intersection-observer";
import oldReviews from "../data/oldReviews";

const AnimatedSection = ({ children, isDesktop = true }) => {
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });
  const visible = !isDesktop || inView;
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(30px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
    >
      {children}
    </div>
  );
};

const apiUrl = process.env.REACT_APP_API_URL || "https://exdollarium-6f0f5aab6a7d.herokuapp.com";

const Home = () => {
  const [latestReviews, setLatestReviews] = useState([]);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 980 : true);
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 980);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchLatestReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLatestReviews = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/approved`);
      let reviewsFromApi = response.data.slice(0, 5);
      if (reviewsFromApi.length < 5) {
        const needed = 5 - reviewsFromApi.length;
        reviewsFromApi = [...reviewsFromApi, ...oldReviews.slice(0, needed)];
      }
      setLatestReviews(reviewsFromApi);
    } catch (error) {
      console.error("Error fetching latest reviews:", error);
      setLatestReviews(oldReviews.slice(0, 5));
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--navy)' }}>
      <FloatingBackground />

      {/* Hero */}
      <div id="home">
        <Hero />
      </div>

      <AnimatedSection isDesktop={isDesktop}>
        <About />
      </AnimatedSection>

      <AnimatedSection isDesktop={isDesktop}>
        <Services />
      </AnimatedSection>

      <AnimatedSection isDesktop={isDesktop}>
        <WhyChooseUsTree />
      </AnimatedSection>

      {/* Testimonials */}
      <AnimatedSection isDesktop={isDesktop}>
        <section style={s.testimonials}>
          <div style={s.testimonialsHeader}>
            <span style={s.tag}>TESTIMONIALS</span>
            <h2 style={s.testimonialsHeading}>
              What Our <span style={{ color: 'var(--gold)' }}>Customers Say</span>
            </h2>
            <p style={s.testimonialsSub}>Real experiences from traders across Nigeria.</p>
          </div>

          {latestReviews.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center' }}>No reviews yet. Be the first to leave one!</p>
          ) : (
            <div style={s.reviewGrid}>
              {latestReviews.map((review, i) => (
                <div key={review._id || i} style={s.reviewCard}>
                  <div style={s.stars}>{Array(review.rating || 5).fill('\u2B50').join('')}</div>
                  <p style={s.reviewText}>&#8220;{review.reviewText}&#8221;</p>
                  <div style={s.reviewFooter}>
                    <div style={s.reviewAvatar}>
                      {(review.userId?.username || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={s.reviewAuthor}>{review.userId?.username || 'Anonymous'}</div>
                      <div style={s.reviewService}>{review.confirmationId?.serviceId?.name || 'Exchange Service'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <button style={s.seeMoreBtn} onClick={() => navigate('/testimonials')}>
              See All Reviews &rarr;
            </button>
          </div>
        </section>
      </AnimatedSection>

      {/* Calculator */}
      <AnimatedSection isDesktop={isDesktop}>
        <Calculator />
      </AnimatedSection>

      {/* FAQ + Contact stacked */}
      <AnimatedSection isDesktop={isDesktop}>
        <FAQ />
      </AnimatedSection>

      <AnimatedSection isDesktop={isDesktop}>
        <Contact />
      </AnimatedSection>

      <Footer />
    </div>
  );
};

const s = {
  testimonials: {
    padding: '88px 5%',
    background: 'var(--navy-3)',
  },
  testimonialsHeader: {
    textAlign: 'center',
    maxWidth: 580,
    margin: '0 auto 52px',
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
    marginBottom: 16,
  },
  testimonialsHeading: {
    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: -0.8,
    lineHeight: 1.2,
    marginBottom: 10,
  },
  testimonialsSub: {
    fontSize: '1rem',
    color: 'var(--muted-light)',
    margin: 0,
  },
  reviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
    maxWidth: 1100,
    margin: '0 auto',
  },
  reviewCard: {
    background: 'var(--navy-card)',
    border: '1px solid var(--navy-border)',
    borderRadius: 16,
    padding: '24px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  stars: {
    fontSize: 14,
    letterSpacing: 2,
  },
  reviewText: {
    fontSize: '0.9rem',
    color: 'var(--muted-light)',
    lineHeight: 1.7,
    fontStyle: 'italic',
    flex: 1,
    margin: 0,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
  },
  reviewFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'rgba(245,166,35,0.15)',
    border: '1px solid rgba(245,166,35,0.3)',
    color: 'var(--gold)',
    fontWeight: 800,
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  reviewAuthor: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text)',
  },
  reviewService: {
    fontSize: '0.75rem',
    color: 'var(--muted)',
  },
  seeMoreBtn: {
    background: 'transparent',
    border: '1px solid var(--navy-border)',
    color: 'var(--text)',
    padding: '12px 28px',
    borderRadius: 100,
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'border-color 200ms, color 200ms',
  },
};

export default Home;
