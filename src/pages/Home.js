import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import Calculator from "../components/Calculator";
import FAQ from "../components/FAQ";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

// Higher Order Component for scroll animations
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

const Home = () => {
  const [showNotice, setShowNotice] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => setShowNotice(false), 500);
  };

  return (
    <div>
      <Header />

      {/* Notice Popup */}
      {showNotice && (
        <div
          style={{
            ...styles.popupNotice,
            opacity: fadeOut ? 0 : 1,
            transform: fadeOut ? "translateY(-20px)" : "translateY(0)",
          }}
        >
          <div style={styles.popupContent}>
            <p>🚀 Welcome to Exdollarium! Get the best exchange rates now.</p>
            <button style={styles.closeBtn} onClick={handleClose}>
              ✖
            </button>
          </div>
        </div>
      )}

      <Hero />
      <AnimatedSection>
        <About />
      </AnimatedSection>
      <AnimatedSection>
        <Services />
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

// Updated styles with animations
const styles = {
  popupNotice: {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translate(-50%, 0)",
    background: "#d0e6fd", // Light Sky Blue
    color: "#162660", // Deep Navy Blue
    padding: "15px 25px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    fontWeight: "600",
    border: "2px solid #162660",
    transition: "opacity 0.5s ease, transform 0.5s ease",
    animation: "fadeInSlide 0.6s ease-out",
  },
  popupContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  closeBtn: {
    background: "#f1e4d1", // Soft Beige
    border: "none",
    color: "#162660",
    fontSize: "18px",
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: "50%",
    fontWeight: "bold",
    transition: "background 0.3s ease, transform 0.2s ease",
  },
};

// Adding Keyframe Animation in CSS
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes fadeInSlide {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`, styleSheet.cssRules.length);

export default Home;
