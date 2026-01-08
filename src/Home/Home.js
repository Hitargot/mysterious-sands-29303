import { useEffect, useState } from "react";
import React from 'react'; // Add this import statement
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
import oldReviews from "../data/oldReviews"; // Import old reviews


const AnimatedSection = ({ children, isDesktop = true }) => {
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });

  // On mobile (isDesktop === false) avoid hiding content with animation so sections
  // that rely on JS animations (or IntersectionObserver) still render visibly.
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



const apiUrl = "https://exdollarium-6f0f5aab6a7d.herokuapp.com";
//const apiUrl = "http://localhost:22222"; 

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
  }, []);

  
// Fetch the latest 5 approved reviews or fallback to old reviews
const fetchLatestReviews = async () => {
  try {
    // Attempt to fetch approved reviews from the API
    const response = await axios.get(`${apiUrl}/api/approved`);
    
    // Get the latest reviews from the API
    let reviewsFromApi = response.data.slice(0, 5); // Get only the latest 5 reviews
    
    // If the API provides fewer than 5 reviews, fill the rest from oldReviews
    if (reviewsFromApi.length < 5) {
      const additionalReviewsNeeded = 5 - reviewsFromApi.length;
      const additionalReviews = oldReviews.slice(0, additionalReviewsNeeded); // Get the required number of reviews from oldReviews
      reviewsFromApi = [...reviewsFromApi, ...additionalReviews]; // Combine API reviews and old reviews to make up 5
    }
    
    // Set the final list of reviews (up to 5)
    setLatestReviews(reviewsFromApi);
  } catch (error) {
    // If the API call fails, fallback to using only oldReviews
    console.error("Error fetching latest reviews from API:", error);
    setLatestReviews(oldReviews.slice(0, 5)); // Use the first 5 reviews from oldReviews as a fallback
  }
};


  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #fbfdff 0%, #f7fbff 40%, #f1f6ff 100%)' }}>
      {/* Decorative floating shapes */}
      <FloatingBackground />

      {/* Hero area (Header is rendered inside Hero for EXO full-bleed layout) */}
      <div style={styles.heroWrapper} id="home">
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

            {/* Testimonials Preview Section */}
      <AnimatedSection isDesktop={isDesktop}>
        <div style={styles.testimonialsSection}>
          <h2 style={styles.heading}>What Our Customers Say</h2>

          {latestReviews.length === 0 ? (
            <p style={styles.noReviews}>No reviews yet. Be the first to leave one!</p>
          ) : (
            <div style={styles.reviewsContainer}>
              {latestReviews.map((review) => (
                <div key={review._id} style={styles.reviewCard}>
                  <p style={styles.reviewText}>"{review.reviewText}"</p>
                  <p style={styles.reviewAuthor}>- {review.userId?.username || "Anonymous"}</p>
                  <p style={styles.reviewText}>Service: {review.confirmationId?.serviceId?.name || "Unknown"}</p>
                  <div style={styles.starRating}>{"⭐".repeat(review.rating)}</div>
                </div>
              ))}
            </div>
          )}

          {/* "See More" Button */}
          <button style={styles.seeMoreButton} onClick={() => navigate("/testimonials")}>
            See More Reviews
          </button>
        </div>
  </AnimatedSection>

      <AnimatedSection isDesktop={isDesktop}>
        {/* Use a responsive calc container: centered on desktop, stacked on mobile */}
        <div style={isDesktop ? { ...styles.calcLayout, alignItems: 'center' } : styles.calcLayoutMobile}>
          <div style={styles.calcMain}>
            <Calculator />
          </div>

          {isDesktop && (
            <aside style={styles.sidePanel} aria-hidden={!isDesktop}>
              <h3 style={styles.sideHeading}>Quick tips</h3>
              <ul style={styles.sideList}>
                <li>Choose the service you want to exchange from the Services section.</li>
                <li>Select your currency and enter the amount to see NGN estimate.</li>
                <li>Transactions are processed quickly — typical payout within minutes.</li>
              </ul>
              <p style={styles.sideMore}><a href="#faq">See FAQs</a> or <a href="#contact">Contact us</a> for help.</p>
            </aside>
          )}
        </div>
  </AnimatedSection>



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

// Styles
const styles = {
  heroWrapper: {
    minHeight: '70vh',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0 20px 0',
    position: 'relative',
    zIndex: 10,
  },
  /* Hero card styles */
  heroCard: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'linear-gradient(180deg, #ffffff, #f7fbff)',
    borderRadius: 16,
    padding: 28,
    width: 'min(920px, 92%)',
    boxShadow: '0 20px 60px rgba(10,20,40,0.18)',
    zIndex: 20,
    textAlign: 'center',
  },
  heroCardTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#162660',
    marginBottom: 8,
  },
  heroCardSub: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 16,
  },
  heroForm: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  emailInput: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(22,38,96,0.08)',
    width: 320,
    fontSize: 14,
  },
  heroPrimaryBtn: {
    background: '#162660',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: 10,
    border: 'none',
    fontWeight: 700,
    cursor: 'pointer',
  },
  heroActions: {
    marginTop: 12,
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
  },
  ghostBtn: {
    background: 'transparent',
    border: 'none',
    color: '#162660',
    fontWeight: 600,
    cursor: 'pointer',
  },
  /* Calculator layout */
  calcLayout: {
    display: 'flex',
    gap: 24,
    maxWidth: 1100,
    margin: '30px auto',
    alignItems: 'center',
    padding: '0 20px',
  },
  calcMain: {
    flex: '1 1 560px',
    minWidth: 320,
  },
  /* Mobile variant: stack and center */
  calcLayoutMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    maxWidth: 720,
    margin: '18px auto',
    alignItems: 'center',
    padding: '0 16px',
  },
  sidePanel: {
    width: 320,
    background: '#ffffff',
    borderRadius: 12,
    padding: 18,
    boxShadow: '0 10px 30px rgba(16,24,40,0.06)',
    color: '#162660',
    lineHeight: 1.45,
  },
  sideHeading: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: 18,
  },
  sideList: {
    paddingLeft: 18,
    margin: '8px 0 12px 0',
  },
  sideMore: {
    marginTop: 12,
  },
  secondarySmallBtn: {
    background: 'transparent',
    color: '#334155',
    border: '1px solid rgba(22,38,96,0.08)',
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer',
  },

  partnersSection: {
    padding: '18px 14px',
    background: '#fff',
    textAlign: 'center',
    borderBottom: '1px solid rgba(16,24,40,0.04)',
  },
  partnersInner: {
    display: 'flex',
    gap: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    maxWidth: 1000,
    margin: '0 auto',
  },
  partnerLogo: {
    minWidth: 96,
    padding: '8px 12px',
    borderRadius: 8,
    background: 'linear-gradient(180deg, rgba(22,38,96,0.03), rgba(22,38,96,0.01))',
    color: '#162660',
    fontWeight: 700,
    fontSize: 13,
    textAlign: 'center',
  },
  testimonialsSection: {
    backgroundColor: "#d0e6fd",
    padding: "40px 20px",
    textAlign: "center",
  },
  heading: {
    color: "#162660",
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  noReviews: {
    fontSize: "16px",
    color: "#333",
  },
  reviewsContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "20px",
  },
  reviewCard: {
    backgroundColor: "#162660",
    color: "#f1e4d1",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    maxWidth: "300px",
    width: "100%",
    minHeight: "180px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  reviewText: {
    fontSize: "16px",
    fontStyle: "italic",
    lineHeight: "1.5",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    color: "#f8c471",
  },
  reviewAuthor: {
    fontWeight: "bold",
    marginTop: "10px",
    color: "#d0e6fd",
    fontSize: "14px",
  },
  starRating: {
    fontSize: "18px",
    color: "#FFD700",
    marginTop: "5px",
  },
  seeMoreButton: {
    backgroundColor: "#162660",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background 0.3s",
  },
};

export default Home;