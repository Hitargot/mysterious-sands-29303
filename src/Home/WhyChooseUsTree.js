import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styled from "styled-components";
import { FaBolt, FaShieldAlt, FaMoneyBillWave, FaUsers, FaEye } from "react-icons/fa";

// Styled Components
const FlowchartContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  background: linear-gradient(180deg, #0f2348 0%, #10223a 100%);
  color: white;
  border-radius: 12px;
  width: 100%;
`;

const Title = styled.h2`
  font-size: 1.65rem;
  font-weight: 800;
  margin-bottom: 12px;
  color: #f1f9ff;
  text-align: center;
`;

const Grid = styled.div`
  width: 100%;
  max-width: 1100px;
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr;

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1100px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Card = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  color: #e9f2ff;
  transform: translateY(18px);
  opacity: 0;
  cursor: default;
`;

const IconCircle = styled.div`
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.06);
  border-radius: 999px;
  font-size: 1.2rem;
  color: #ffdca3;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.div`
  font-weight: 800;
  font-size: 1.05rem;
  color: #f4fbff;
`;

const CardDetails = styled.div`
  margin-top: 6px;
  font-size: 0.95rem;
  color: #d0e6fd;
  line-height: 1.35;
`;

// Benefits Data (no images, icon-only cards)
const benefits = [
  { text: "Fast Transactions", icon: <FaBolt />, details: "Transactions processed within minutes so you can get your funds quickly." },
  { text: "Secure & Reliable", icon: <FaShieldAlt />, details: "State-of-the-art security and fraud protection to keep funds safe." },
  { text: "Best Exchange Rates", icon: <FaMoneyBillWave />, details: "Competitive rates and transparent pricing — no surprises." },
  { text: "Trusted by Thousands", icon: <FaUsers />, details: "A large base of satisfied users who trust our service every day." },
  { text: "No Hidden Fees", icon: <FaEye />, details: "Clear fees and no hidden charges — what you see is what you get." },
];

export default function WhyChooseUsFlowchart() {
  const cardRefs = useRef([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    // fade-up animation for cards
    if (cardRefs.current && cardRefs.current.length) {
      gsap.to(cardRefs.current, {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power2.out",
      });
    }
  }, []);

  const toggleDetails = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <FlowchartContainer>
      <Title>Why Choose Us?</Title>
      <Grid>
        {benefits.map((benefit, index) => (
          <Card
            key={index}
            ref={(el) => (cardRefs.current[index] = el)}
            onClick={() => toggleDetails(index)}
            role="button"
            tabIndex={0}
            aria-expanded={expandedIndex === index}
          >
            <IconCircle>{benefit.icon}</IconCircle>
            <CardBody>
              <CardTitle>{benefit.text}</CardTitle>
              <CardDetails>{expandedIndex === index ? benefit.details : benefit.details}</CardDetails>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </FlowchartContainer>
  );
}