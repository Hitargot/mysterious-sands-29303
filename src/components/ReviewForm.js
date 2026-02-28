import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ResponsiveLogo from './ResponsiveLogo';
import Alert from "../components/Alert";
import { FaStar, FaPaperPlane } from 'react-icons/fa';

const G = {
  navy: '#0A0F1E', navy2: '#0F172A',
  gold: '#F5A623', goldLight: '#FBBF24', goldFaint: 'rgba(245,166,35,0.08)',
  goldBorder: 'rgba(245,166,35,0.18)',
  white: '#F1F5F9', slate: '#94A3B8', slateD: '#64748B',
};

const ReviewForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const confirmationId = queryParams.get("confirmationId");

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmationId) {
      setMessage("Confirmation ID is missing!");
      return;
    }

    const apiUrl = process.env.REACT_APP_API_URL;
    setSubmitting(true);

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
      setMessage(error.response?.data?.message || "Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  const starLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, #060c1a 0%, ${G.navy} 55%, #0d1526 100%)`,
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', maxWidth: 600, maxHeight: 600, background: 'radial-gradient(ellipse, rgba(245,166,35,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: '35vw', height: '35vw', maxWidth: 400, maxHeight: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: 440,
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: '40px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <ResponsiveLogo alt="Exdollarium" style={{ height: 34, width: 34, filter: 'brightness(0) invert(1)' }} />
          <span style={{ color: G.white, fontWeight: 900, fontSize: '1.05rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Exdollarium
          </span>
        </div>

        {message && <Alert message={message} type={message.toLowerCase().includes('error') || message.toLowerCase().includes('missing') ? 'error' : 'success'} onClose={() => setMessage('')} />}

        {/* Title */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: G.goldFaint, border: `1px solid ${G.goldBorder}`,
          color: G.gold, fontSize: 10, fontWeight: 700, letterSpacing: '2px',
          textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, marginBottom: 14,
        }}>
          <FaStar style={{ fontSize: 10 }} /> Rate Your Experience
        </div>
        <h2 style={{ margin: '0 0 6px', color: G.white, fontWeight: 900, fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
          Submit a Review
        </h2>
        <p style={{ margin: '0 0 28px', color: G.slateD, fontSize: '0.85rem' }}>
          Share your experience and help us improve.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Star rating */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', color: G.slate, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>
              Rating
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    background: 'none', border: 'none', padding: '2px 4px',
                    cursor: 'pointer', lineHeight: 1,
                    fontSize: '1.9rem',
                    color: star <= (hover || rating) ? G.goldLight : 'rgba(255,255,255,0.15)',
                    transition: 'color 120ms, transform 120ms',
                    transform: star <= (hover || rating) ? 'scale(1.1)' : 'scale(1)',
                  }}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <FaStar />
                </button>
              ))}
              {(hover || rating) > 0 && (
                <span style={{ color: G.goldLight, fontSize: '0.82rem', fontWeight: 700, marginLeft: 4 }}>
                  {starLabels[hover || rating]}
                </span>
              )}
            </div>
          </div>

          {/* Review textarea */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', color: G.slate, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>
              Your Review
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Share your experience with us…"
              required
              rows={4}
              style={{
                width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${focused ? 'rgba(245,166,35,0.6)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10, color: G.white, fontSize: '0.9rem',
                outline: 'none', resize: 'vertical', lineHeight: 1.6,
                fontFamily: 'inherit', transition: 'border-color 180ms',
              }}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            style={{
              width: '100%', padding: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: (submitting || rating === 0) ? 'rgba(245,166,35,0.4)' : btnHovered ? G.goldLight : G.gold,
              color: '#000', fontWeight: 800, fontSize: '0.95rem',
              border: 'none', borderRadius: 100,
              cursor: (submitting || rating === 0) ? 'not-allowed' : 'pointer',
              transition: 'background 180ms, transform 150ms',
              transform: btnHovered && !submitting && rating > 0 ? 'translateY(-1px)' : 'none',
            }}
          >
            <FaPaperPlane style={{ fontSize: 14 }} />
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;

