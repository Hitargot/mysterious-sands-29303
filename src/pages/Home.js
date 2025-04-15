import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import WhyChooseUsTree from "../components/WhyChooseUsTree";
import Calculator from "../components/Calculator";
import FAQ from "../components/FAQ";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { useInView } from "react-intersection-observer";
import oldReviews from "../data/oldReviews"; // Import old reviews


const AnimatedSection = ({ children }) => {
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0px)" : "translateY(30px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
    >
      {children}
    </div>
  );
};



const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
//const apiUrl = "http://localhost:22222"; 

const Home = () => {
  const [latestReviews, setLatestReviews] = useState([]);
  const navigate = useNavigate();

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
    <div>
      <Header />
      <Hero />

      <AnimatedSection>
        <About />
      </AnimatedSection>

      <AnimatedSection>
        <Services />
      </AnimatedSection>

      <AnimatedSection>
        <WhyChooseUsTree />
      </AnimatedSection>

            {/* Testimonials Preview Section */}
      <AnimatedSection>
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

      <AnimatedSection>
        <Calculator />
      </AnimatedSection>



      <AnimatedSection>
        <FAQ />
      </AnimatedSection>

      <AnimatedSection>
        <Contact />
      </AnimatedSection>

      <Footer />
    </div>
  );
};

// Styles
const styles = {
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
