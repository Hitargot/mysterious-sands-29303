import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styled from "styled-components";
import { FaBolt, FaShieldAlt, FaMoneyBillWave, FaUsers, FaEye } from "react-icons/fa";

// Styled Components
const FlowchartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 20px;
  background: linear-gradient(to bottom, #162660, #0e1a45);
  color: white;
  border-radius: 15px;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
`;

const BenefitBox = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  width: 300px;
  box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateX(-50px);
  cursor: pointer;
  transition: background 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const IconWrapper = styled.div`
  font-size: 1.8rem;
  margin-right: 15px;
  color: #d0e6fd;
`;

const ConnectorLine = styled.div`
  width: 3px;
  height: 30px;
  background: #d0e6fd;
  margin: 10px 0;
  opacity: 0;
`;

const DetailsBox = styled.div`
  max-height: ${({ expanded }) => (expanded ? "100px" : "0")};
  overflow: hidden;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: ${({ expanded }) => (expanded ? "10px 15px" : "0")};
  transition: max-height 0.4s ease-in-out, padding 0.3s;
  font-size: 1rem;
  color: #d0e6fd;
  text-align: center;
  width: 280px;
`;

// Benefits Data
const benefits = [
  { text: "Fast Transactions", icon: <FaBolt />, details: "We process transactions within minutes, ensuring your funds are available instantly." },
  { text: "Secure & Reliable", icon: <FaShieldAlt />, details: "Your security is our priority, with advanced encryption and fraud protection." },
  { text: "Best Exchange Rates", icon: <FaMoneyBillWave />, details: "Get the best rates with no hidden fees, maximizing the value of your transactions." },
  { text: "Trusted by Thousands", icon: <FaUsers />, details: "Thousands of satisfied users trust Exdollarium for fast and safe exchanges." },
  { text: "No Hidden Fees", icon: <FaEye />, details: "We maintain transparency, so you never have to worry about unexpected charges." },
];

export default function WhyChooseUsFlowchart() {
  const benefitRefs = useRef([]);
  const lineRefs = useRef([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    gsap.to(benefitRefs.current, {
      opacity: 1,
      x: 0,
      stagger: 0.4,
      duration: 1,
      ease: "power2.out",
    });

    gsap.to(lineRefs.current, {
      opacity: 1,
      delay: 0.2,
      stagger: 0.4,
      duration: 0.8,
    });
  }, []);

  const toggleDetails = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <FlowchartContainer>
      <Title>Why Choose Us?</Title>
      {benefits.map((benefit, index) => (
        <React.Fragment key={index}>
          <BenefitBox ref={(el) => (benefitRefs.current[index] = el)} onClick={() => toggleDetails(index)}>
            <IconWrapper>{benefit.icon}</IconWrapper>
            {benefit.text}
          </BenefitBox>
          <DetailsBox expanded={expandedIndex === index}>{benefit.details}</DetailsBox>
          {index < benefits.length - 1 && (
            <ConnectorLine ref={(el) => (lineRefs.current[index] = el)} />
          )}
        </React.Fragment>
      ))}
    </FlowchartContainer>
  );
}
