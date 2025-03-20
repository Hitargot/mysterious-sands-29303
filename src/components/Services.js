import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import paypalIcon from "../assets/images/path_to_paypal_icon.png";
import cryptoIcon from "../assets/images/path_to_crypto_icon.png";
import payoneerIcon from "../assets/images/path_to_payonee.png";
import fiverrIcon from "../assets/images/path_to_fiverr.png";
import usBankIcon from "../assets/images/path_to_us_bank_icon.png";
import upworkIcon from "../assets/images/path_to_upwork_icon.png";
import websiteRechargeIcon from "../assets/images/path_to_website_recharge_icon.png";
import cardIcon from "../assets/images/2019-01-30-gift-cards.jpeg";

const services = [
  { name: "PayPal Exchange", icon: paypalIcon },
  { name: "Crypto Exchange (BTC, USDT, ETH, etc.)", icon: cryptoIcon },
  { name: "Gift Card (Steam, Apple, iTune, Ebay, etc)", icon: cardIcon },
  { name: "Payoneer Exchange", icon: payoneerIcon },
  { name: "Fiverr Withdrawal", icon: fiverrIcon },
  { name: "US Bank Transfer", icon: usBankIcon },
  { name: "Upwork Withdrawal", icon: upworkIcon },
  { name: "Website Recharge (smscode, pivapin)", icon: websiteRechargeIcon },
];

const ServicesSection = styled.section`
  background: linear-gradient(135deg, #d0e6fd, #f1e4d1);
  color: #162660;
  padding: 80px 20px;
  text-align: center;
  position: relative;
`;

const Heading = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: bold;
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const CarouselWrapper = styled.div`
  position: relative;
  overflow: hidden;
  max-width: 90%;
  margin: auto;
`;

const ServiceCarousel = styled.div`
  display: flex;
  gap: 20px;
  transition: transform 0.5s ease-in-out;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 10px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ServiceCard = styled.div`
  min-width: 200px;
  max-width: 220px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  img {
    width: 80px;
    height: 80px;
    margin-bottom: 15px;
  }

  p {
    font-size: 1.1rem;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    img {
      width: 50px;
      height: 50px;
    }

    p {
      font-size: 0.9rem;
    }
  }
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: #162660;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  opacity: ${({ show }) => (show ? "1" : "0")};
  transition: opacity 0.3s ease-in-out;
  z-index: 10;

  &:hover {
    background: #0e1b4a;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const LeftArrow = styled(ArrowButton)`
  left: 10px;
`;

const RightArrow = styled(ArrowButton)`
  right: 10px;
`;

const Services = () => {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollDirection, setScrollDirection] = useState("right");

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const checkScroll = () => {
      setCanScrollLeft(carousel.scrollLeft > 0);
      setCanScrollRight(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth);
    };

    carousel.addEventListener("scroll", checkScroll);
    checkScroll();

    let interval = setInterval(() => {
      if (scrollDirection === "right" && canScrollRight) {
        scrollCarousel("right");
      } else if (scrollDirection === "left" && canScrollLeft) {
        scrollCarousel("left");
      } else {
        setScrollDirection((prev) => (prev === "right" ? "left" : "right"));
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      carousel.removeEventListener("scroll", checkScroll);
    };
  }, [scrollDirection, canScrollLeft, canScrollRight]);

  const scrollCarousel = (direction) => {
    const scrollAmount = 240;
    const carousel = carouselRef.current;
    if (!carousel) return;

    const newScrollLeft = direction === "left" ? carousel.scrollLeft - scrollAmount : carousel.scrollLeft + scrollAmount;
    carousel.scrollTo({ left: newScrollLeft, behavior: "smooth" });

    setTimeout(() => {
      setCanScrollLeft(carousel.scrollLeft > 0);
      setCanScrollRight(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth);
    }, 300);
  };

  return (
    <ServicesSection id="services">
      <Heading>Our Services</Heading>
      <Description>Explore our range of services by scrolling through the icons below.</Description>

      <CarouselWrapper>
        <LeftArrow show={canScrollLeft} onClick={() => scrollCarousel("left")}>
          <FaChevronLeft />
        </LeftArrow>

        <ServiceCarousel ref={carouselRef}>
          {services.map((service, index) => (
            <ServiceCard key={index}>
              <img src={service.icon} alt={service.name} />
              <p>{service.name}</p>
            </ServiceCard>
          ))}
        </ServiceCarousel>

        <RightArrow show={canScrollRight} onClick={() => scrollCarousel("right")}>
          <FaChevronRight />
        </RightArrow>
      </CarouselWrapper>
    </ServicesSection>
  );
};

export default Services;
