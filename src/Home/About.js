import { useState, useEffect, useMemo } from "react";
import React from 'react'; // Add this import statement
import styled, { keyframes } from "styled-components";
import image1 from "../assets/images/949shots_so.png"; 
import image2 from "../assets/images/969shots_so.png";
import image3 from "../assets/images/856shots_so.png";
// import johnDoeImg from "../assets/images/path_to_team_member_image1.jpg"; 
// import janeSmithImg from "../assets/images/designer.PNG"; 
// import aliceJohnsonImg from "../assets/images/path_to_team_member_image1.jpg";

const AboutWrapper = styled.div`
  overflow: hidden;
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const AboutSection = styled.section`
  background-color: #f1e4d1;
  color: #162660;
  padding: 60px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 40px;
`;

const AboutImage = styled.img`
  width: 400px;
  height: auto;
  border-radius: 15px;
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.1);
  opacity: 0;
  animation: ${slideIn} 1.2s ease-in-out forwards;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 350px;
  }
`;

const AboutContent = styled.div`
  max-width: 600px;
  text-align: left;

  h3 {
    font-size: 1.8rem;
    margin-bottom: 15px;
  }

  p {
    font-size: 1.2rem;
    line-height: 1.6;
    color: #162660;
  }
`;

// const TeamSection = styled.div`
//   background-color: #d0e6fd;
//   padding: 50px 20px;
// `;

// const Heading = styled.h2`
//   font-size: 2.5rem;
//   color: #162660;
//   text-align: center;
//   margin-bottom: 20px;
// `;

// const TeamGrid = styled.div`
//   display: flex;
//   justify-content: center;
//   gap: 20px;
//   flex-wrap: wrap;
// `;

// const TeamMember = styled.div`
//   background: rgba(255, 255, 255, 0.3);
//   border-radius: 15px;
//   padding: 20px;
//   width: 280px;
//   text-align: center;
//   transition: transform 0.3s ease, box-shadow 0.3s ease;
//   backdrop-filter: blur(10px);

//   &:hover {
//     transform: translateY(-10px);
//     box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
//   }

//   img {
//     width: 100px;
//     height: 100px;
//     border-radius: 50%;
//     border: 3px solid #162660;
//     margin-bottom: 10px;
//   }

//   h4 {
//     font-size: 1.5rem;
//     color: #162660;
//     margin: 10px 0 5px;
//   }

//   p {
//     font-size: 1rem;
//     color: #162660;
//   }
// `;

// const teamMembers = [
//   {
//     name: "Abubakar k.",
//     position: "CEO",
//     image: johnDoeImg,
//     description:
//       "Abubakar is the visionary behind Exdollarium, dedicated to improving exchange services.",
//   },
//   {
//     name: "Jane Smith",
//     position: "CTO",
//     image: janeSmithImg,
//     description:
//       "Jane leads our technology efforts, ensuring our platform is secure and user-friendly.",
//   },
//   {
//     name: "Alice Johnson",
//     position: "Marketing Director",
//     image: aliceJohnsonImg,
//     description:
//       "Alice is passionate about connecting users with our services through effective marketing.",
//   },
// ];


const About = () => {
  const images = useMemo(() => [image1, image2, image3], []);
  const [selectedImage, setSelectedImage] = useState(images[Math.floor(Math.random() * images.length)]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedImage(images[Math.floor(Math.random() * images.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);
  useEffect(() => {
    const aboutText = document.getElementById("about-text");
    if (!aboutText) return;

    const textToType = aboutText.textContent.trim();
    aboutText.textContent = "";

    for (let i = 0; i < textToType.length; i++) {
      setTimeout(() => {
        aboutText.textContent += textToType[i];
      }, 50 * i);
    }
  }, []); // No dependencies needed here

  return (
    <AboutWrapper id="about">
      <AboutSection>
        {/* Force re-animation by changing the key */}
        <AboutImage key={selectedImage} src={selectedImage} alt="About Us" />
        <AboutContent>
          <h3>Exdollarium: Redefining Currency Exchange</h3>
          <p id="about-text">
            Founded in 2024, Exdollarium is where <b>effortless transactions meet cutting-edge innovation.</b> 
            We combine advanced technology with a passion for enhancing user experience, ensuring every exchange 
            is secure, seamless, and stress-free. With trust as our cornerstone, we are transforming financial 
            transactions into a future-focused journey. Ready to join the revolution? Step into the world of 
            endless possibilities with Exdollarium.
          </p>
        </AboutContent>
      </AboutSection>

      {/* <TeamSection>
        <Heading>Meet Our Team</Heading>
        <TeamGrid>
          {teamMembers.map((member, index) => (
            <TeamMember key={index}>
              <img src={member.image} alt={member.name} />
              <h4>{member.name}</h4>
              <p>{member.position}</p>
              <p>{member.description}</p>
            </TeamMember>
          ))}
        </TeamGrid>
      </TeamSection> */}
    </AboutWrapper>
  );
};

export default About;