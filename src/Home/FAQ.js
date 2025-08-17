import React, { useState, useEffect } from "react";
import axios from "axios";

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  const apiUrl = "http://localhost:22222";

  // Fetch FAQs from the backend
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/faqs`);
        setFaqs(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching FAQs:", err);
        setError("Failed to load FAQs.");
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" style={styles.faqSection}>
      <h2 style={styles.title}>Frequently Asked Questions</h2>

      {loading && <p>Loading FAQs...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={styles.faqList}>
          {faqs.length > 0 ? (
            faqs.map((faq, index) => (
              <div key={faq._id} style={styles.faqItem}>
                <div
                  style={{
                    ...styles.faqQuestion,
                    background: activeIndex === index ? "#162660" : "#d0e6fd",
                    color: activeIndex === index ? "#f1e4d1" : "#162660",
                  }}
                  onClick={() => toggleFAQ(index)}
                >
                  {faq.question}
                  <span
                    style={{
                      ...styles.arrow,
                      transform: activeIndex === index ? "rotate(180deg)" : "rotate(0)",
                    }}
                  >
                    ▼
                  </span>
                </div>
                <div
                  style={{
                    ...styles.faqAnswer,
                    maxHeight: activeIndex === index ? "150px" : "0px",
                    opacity: activeIndex === index ? "1" : "0",
                  }}
                >
                  {faq.answer}
                </div>
              </div>
            ))
          ) : (
            <p>No FAQs available.</p>
          )}
        </div>
      )}
    </section>
  );
};

// Inline styles
const styles = {
  faqSection: {
    background: "linear-gradient(135deg, #162660, #d0e6fd, #f1e4d1)",
    padding: "40px",
    borderRadius: "10px",
    maxWidth: "800px",
    margin: "auto",
    color: "#162660",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
  },
  title: {
    textAlign: "center",
    fontSize: "1.8rem",
    marginBottom: "20px",
    color: "#162660",
  },
  faqList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  faqItem: {
    background: "#f1e4d1",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  faqQuestion: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "15px",
    transition: "background 0.3s ease, color 0.3s ease",
  },
  arrow: {
    transition: "transform 0.3s ease",
  },
  faqAnswer: {
    padding: "12px 15px",
    fontSize: "1rem",
    borderTop: "1px solid rgba(0, 0, 0, 0.1)",
    transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
    overflow: "hidden",
  },
};

export default FAQ;