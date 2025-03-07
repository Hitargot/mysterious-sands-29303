import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/images/Exodollarium-01.png";
import Alert from "../components/Alert";

const ReviewForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const confirmationId = queryParams.get("confirmationId");

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
    if (!token) {
      // Store the intended redirect path before redirecting to login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
      navigate("/login"); // Redirect to login
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmationId) {
      setMessage("Confirmation ID is missing!");
      return;
    }

    const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";

    try {
      const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
      const response = await axios.post(
        `${apiUrl}/api/review/submit`,
        { confirmationId, rating, reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(response.data.message);
      setRating(0);
      setReviewText("");

      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      console.error("Error:", error.response);
      setMessage(error.response?.data?.message || "Error submitting review");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#d0e6fd" }}>
      <div style={{
        maxWidth: "400px",
        padding: "25px",
        backgroundColor: "#162660",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        textAlign: "center"
      }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", color: "#f1e4d1", fontWeight: "bold" }}>
            <img src={logo} alt="Logo" style={{ height: "30px", marginRight: "10px" }} />
            <span>Exdollarium</span>
          </div>
        </header>

        <h2 style={{ color: "#f1e4d1", marginBottom: "15px" }}>Submit a Review</h2>
        <p style={{ color: "#d0e6fd", marginBottom: "15px" }}>Share your experience with us!</p>

        {message && <Alert message={message} type="success" />}

        <form onSubmit={handleSubmit}>
          <label style={{ color: "#f1e4d1", display: "block", marginBottom: "10px" }}>Rating:</label>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
            {[1, 2, 3, 4, 5].map((star, index) => (
              <span
                key={index}
                style={{
                  fontSize: "30px",
                  cursor: "pointer",
                  color: index < (hover || rating) ? "gold" : "#ccc",
                  transition: "color 0.2s"
                }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(null)}
              >
                ★
              </span>
            ))}
          </div>

          <label style={{ color: "#f1e4d1", display: "block", marginBottom: "5px" }}>Review:</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review..."
            required
            style={{
              padding: "10px",
              width: "100%",
              height: "80px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              resize: "none",
              fontSize: "14px",
              outline: "none"
            }}
          />

          <button type="submit" style={{
            marginTop: "15px",
            width: "100%",
            padding: "10px",
            border: "none",
            backgroundColor: "#d0e6fd",
            color: "#162660",
            fontSize: "16px",
            cursor: "pointer",
            borderRadius: "5px",
            fontWeight: "bold"
          }}>
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
