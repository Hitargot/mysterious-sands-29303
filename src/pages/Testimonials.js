import React, { useEffect, useState } from "react";
import axios from "axios";
import TestimonialHeader from "../components/TestimonialsHeader"; // Importing header component

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222"; 

  const fetchApprovedReviews = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/approved`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
    setLoading(false); // Stop loading after fetching data
  };

  return (
    <div style={{ backgroundColor: "#d0e6fd", minHeight: "100vh", paddingBottom: "30px" }}>
      {/* Header */}
      <TestimonialHeader />

      {/* Testimonials Section */}
      <div style={{
        maxWidth: "800px",
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

        {/* Loading Effect */}
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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "15px",
            width: "100%",
          }}>
            {reviews.map((review) => (
              <div key={review._id} style={{
                backgroundColor: "#162660",
                color: "#f1e4d1",
                borderRadius: "10px",
                padding: "20px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                transition: "transform 0.3s ease-in-out",
                maxWidth: "400px",
                margin: "10px auto",
                cursor: "pointer",
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <p style={{ fontSize: "16px", fontStyle: "italic", lineHeight: "1.5" }}>
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
                  Service: {review.confirmationId?.serviceId?.serviceName || "Unknown"}
                </p>

                {/* ⭐ Star Rating */}
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
