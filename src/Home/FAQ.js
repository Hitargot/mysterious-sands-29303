import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;
  const answerRefs = useRef([]);

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
  }, [apiUrl]);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleKey = (e, index) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFAQ(index);
    }
  };

  const filteredFaqs = faqs.filter((f) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (f.question || "").toLowerCase().includes(q) ||
      (f.answer || "").toLowerCase().includes(q)
    );
  });

  return (
    <section id="faq" style={styles.faqSection}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Frequently Asked Questions</h2>
        <div style={styles.searchWrap}>
          <input
            aria-label="Search FAQs"
            placeholder="Search FAQs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.searchInput}
          />
          {query && (
            <button style={styles.clearBtn} onClick={() => setQuery("")}>✕</button>
          )}
        </div>
      </div>

      {loading && <p>Loading FAQs...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={styles.faqGrid}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              // derive index in original array for refs / state
              const index = faqs.indexOf(faq);
              const isOpen = activeIndex === index;
              return (
                <div key={faq._id || index} style={styles.card}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleFAQ(index)}
                    onKeyDown={(e) => handleKey(e, index)}
                    style={{
                      ...styles.question,
                      background: isOpen ? "#162660" : "transparent",
                      color: isOpen ? "#f1e4d1" : "#10223a",
                    }}
                    aria-expanded={isOpen}
                  >
                    <span style={styles.qText}>{faq.question}</span>
                    <span style={{ ...styles.chev, transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                  </div>

                  <div
                    ref={(el) => (answerRefs.current[index] = el)}
                    style={{
                      ...styles.answer,
                      maxHeight: isOpen ? "1000px" : "0px",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    {faq.answer}
                  </div>
                </div>
              );
            })
          ) : (
            <p>No FAQs match your search.</p>
          )}
        </div>
      )}
    </section>
  );
};

// Inline styles
const styles = {
  faqSection: {
    background: "linear-gradient(180deg, #f6f9ff 0%, #eaf3ff 100%)",
    padding: "28px 20px",
    borderRadius: "12px",
    maxWidth: "1100px",
    margin: "18px auto",
    color: "#10223a",
    boxShadow: "0 6px 20px rgba(16,24,40,0.06)",
  },
  headerRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: 800,
    margin: 0,
    color: "#10223a",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(16,24,40,0.08)",
    minWidth: 220,
    fontSize: 14,
  },
  clearBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    color: "#334155",
  },
  faqGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },
  card: {
    background: "#ffffff",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(16,24,40,0.04)",
    overflow: "hidden",
  },
  question: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.25s ease, color 0.25s ease",
  },
  qText: {
    display: "block",
    maxWidth: "calc(100% - 40px)",
  },
  chev: {
    transition: "transform 0.25s ease",
    marginLeft: 12,
    color: "#334155",
  },
  answer: {
    padding: "12px 16px",
    fontSize: 14,
    color: "#334155",
    borderTop: "1px solid rgba(16,24,40,0.04)",
    transition: "max-height 0.35s ease, opacity 0.25s ease",
    overflow: "hidden",
  },
  // Responsive overrides (applied via JS style merging in render when appropriate)
  '@media(minWidth:720px)': {
    faqGrid: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    }
  }
};

export default FAQ;