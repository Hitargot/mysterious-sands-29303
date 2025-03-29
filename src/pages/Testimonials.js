import React, { useEffect, useState } from "react";
import axios from "axios";
import TestimonialHeader from "../components/TestimonialsHeader"; 
import oldReviews from "../data/oldReviews"; // Import old reviews

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true); 

  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222";

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const fetchApprovedReviews = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/approved`);
      console.log("Fetched Reviews:", response.data); 
      setReviews([...response.data, ...oldReviews]); // Merge API + old reviews
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([...oldReviews]); // Show old reviews if API fails
    }
    setLoading(false);
  };

  return (
    <div style={{
      backgroundColor: "#d0e6fd",
      minHeight: "100vh",
      paddingBottom: "30px",
    }}>
      <TestimonialHeader />
    
      <div style={{
        maxWidth: "900px",
        width: "90%",
        margin: "auto",
        padding: "25px",
        textAlign: "center",
      }}>
        <h2 style={{
          color: "#162660",
          fontSize: "26px",
          fontWeight: "bold",
          marginBottom: "20px",
        }}>
          What Our Customers Say
        </h2>
    
        {loading ? (
          <p style={{
            textAlign: "center",
            fontSize: "18px",
            color: "#162660",
            fontWeight: "bold",
            animation: "fadeIn 1s infinite alternate",
          }}>
            Loading reviews...
          </p>
        ) : reviews.length === 0 ? (
          <p style={{ textAlign: "center", color: "#333", fontSize: "16px" }}>
            No reviews yet. Be the first to leave one!
          </p>
        ) : (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "15px",
          }}>
            {reviews.map((review) => (
              <div key={review._id} style={{
                backgroundColor: "#162660",
                color: "#f1e4d1",
                borderRadius: "10px",
                padding: "20px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                transition: "transform 0.3s ease-in-out",
                maxWidth: "300px",
                width: "100%",
                minHeight: "180px", 
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <p style={{
                  fontSize: "16px",
                  fontStyle: "italic",
                  lineHeight: "1.5",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 3, 
                  WebkitBoxOrient: "vertical",
                }}>
                  "{review.reviewText}"
                </p>
    
                <p style={{
                  fontWeight: "bold",
                  marginTop: "10px",
                  color: "#d0e6fd",
                  fontSize: "14px",
                }}>
                  - {review.userId?.username || "Anonymous"}
                </p>
    
                <p style={{ fontStyle: "italic", fontSize: "14px", color: "#f8c471" }}>
                  Service: {review.confirmationId?.serviceId?.name || "Unknown"}
                </p>
    
                <div style={{
                  fontSize: "20px",
                  color: "#FFD700",
                  marginTop: "5px",
                }}>
                  {"⭐".repeat(review.rating)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Testimonials;
