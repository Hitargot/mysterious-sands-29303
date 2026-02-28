import React, { useState, useEffect } from "react";
import axios from "axios";

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

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
    <section id="faq" style={s.section}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.tag}>FAQ</span>
        <h2 style={s.heading}>Frequently Asked <span style={{ color: 'var(--gold)' }}>Questions</span></h2>
        <p style={s.lead}>Everything you need to know about trading with Exdollarium.</p>
        {/* Search */}
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            aria-label="Search FAQs"
            placeholder="Search questions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={s.searchInput}
          />
          {query && (
            <button style={s.clearBtn} onClick={() => setQuery("")} aria-label="Clear search">✕</button>
          )}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div style={s.stateBox}>
          <span style={s.spinner}>⏳</span>
          <p style={{ color: 'var(--muted-light)', margin: 0 }}>Loading FAQs…</p>
        </div>
      )}
      {error && (
        <div style={s.errorBox}>{error}</div>
      )}

      {/* Accordion list */}
      {!loading && !error && (
        <div style={s.list}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const index = faqs.indexOf(faq);
              const isOpen = activeIndex === index;
              return (
                <div
                  key={faq._id || index}
                  style={{
                    ...s.item,
                    borderColor: isOpen ? 'rgba(245,166,35,0.4)' : 'var(--navy-border)',
                  }}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    onKeyDown={(e) => handleKey(e, index)}
                    style={{
                      ...s.question,
                      background: isOpen ? 'rgba(245,166,35,0.06)' : 'transparent',
                    }}
                    aria-expanded={isOpen}
                  >
                    <span style={s.qNum}>{String(index + 1).padStart(2, '0')}</span>
                    <span style={s.qText}>{faq.question}</span>
                    <span
                      style={{
                        ...s.chev,
                        color: isOpen ? 'var(--gold)' : 'var(--muted)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▾
                    </span>
                  </button>

                  <div
                    style={{
                      ...s.answer,
                      maxHeight: isOpen ? '800px' : '0px',
                      opacity: isOpen ? 1 : 0,
                      paddingTop: isOpen ? 0 : 0,
                      paddingBottom: isOpen ? 20 : 0,
                    }}
                  >
                    <p style={s.answerText}>{faq.answer}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={s.stateBox}>
              <p style={{ color: 'var(--muted-light)', margin: 0 }}>No FAQs match "<strong>{query}</strong>"</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

const s = {
  section: {
    padding: '88px 5%',
    background: 'var(--navy-2)',
  },
  header: {
    textAlign: 'center',
    maxWidth: 680,
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
  heading: {
    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
    fontWeight: 800,
    letterSpacing: -0.8,
    color: '#fff',
    marginBottom: 12,
    lineHeight: 1.2,
  },
  lead: {
    fontSize: '1rem',
    color: 'var(--muted-light)',
    lineHeight: 1.7,
    marginBottom: 28,
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--navy-card)',
    border: '1px solid var(--navy-border)',
    borderRadius: 100,
    padding: '8px 18px',
    gap: 10,
    maxWidth: 420,
    margin: '0 auto',
  },
  searchIcon: {
    fontSize: 14,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text)',
    fontSize: '0.95rem',
  },
  clearBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--muted)',
    padding: 0,
    lineHeight: 1,
  },
  stateBox: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  spinner: {
    fontSize: 24,
    display: 'block',
    marginBottom: 10,
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#FCA5A5',
    borderRadius: 10,
    padding: '14px 18px',
    maxWidth: 520,
    margin: '0 auto',
    textAlign: 'center',
  },
  list: {
    maxWidth: 780,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  item: {
    background: 'var(--navy-card)',
    border: '1px solid',
    borderRadius: 14,
    overflow: 'hidden',
    transition: 'border-color 250ms',
  },
  question: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '18px 20px',
    cursor: 'pointer',
    border: 'none',
    textAlign: 'left',
    transition: 'background 250ms',
    borderRadius: 0,
  },
  qNum: {
    fontSize: '0.7rem',
    fontWeight: 800,
    color: 'var(--gold)',
    letterSpacing: '1px',
    minWidth: 22,
    opacity: 0.7,
  },
  qText: {
    flex: 1,
    fontSize: '0.975rem',
    fontWeight: 700,
    color: 'var(--text)',
    lineHeight: 1.4,
  },
  chev: {
    fontSize: 18,
    transition: 'transform 250ms, color 250ms',
    lineHeight: 1,
  },
  answer: {
    overflow: 'hidden',
    transition: 'max-height 350ms ease, opacity 250ms ease, padding 250ms ease',
  },
  answerText: {
    margin: 0,
    padding: '0 20px 0 56px',
    fontSize: '0.9rem',
    color: 'var(--muted-light)',
    lineHeight: 1.75,
  },
};

export default FAQ;