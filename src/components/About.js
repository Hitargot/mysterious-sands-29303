import React, { useEffect } from 'react';
import styled from 'styled-components';
import johnDoeImg from '../assets/images/path_to_team_member_image1.jpg'; 
import janeSmithImg from '../assets/images/path_to_team_member_image.jpg'; 
import aliceJohnsonImg from '../assets/images/path_to_team_member_image1.jpg'; 

const teamMembers = [
  {
    name: 'John Doe',
    position: 'CEO',
    image: johnDoeImg,
    description: 'John is the visionary behind Exdollarium, dedicated to improving exchange services.',
  },
  {
    name: 'Jane Smith',
    position: 'CTO',
    image: janeSmithImg,
    description: 'Jane leads our technology efforts, ensuring our platform is secure and user-friendly.',
  },
  {
    name: 'Alice Johnson',
    position: 'Marketing Director',
    image: aliceJohnsonImg,
    description: 'Alice is passionate about connecting users with our services through effective marketing.',
  },
];

// Styled components
const AboutWrapper = styled.div`
  overflow: hidden; /* Ensures smooth transition between sections */
`;

const AboutSection = styled.section`
  background-color: #f1e4d1; /* Warm Beige */
  color: #162660; /* Navy Blue */
  padding: 60px 20px;
  text-align: center;
  position: relative;
  animation: fadeIn 1.5s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Heading = styled.h2`
  font-size: 2.5rem;
  color: #162660;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  opacity: 0;
  animation: slideIn 1s ease-in-out forwards;

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

const AboutText = styled.p`
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto 20px;
  color: #162660;
  line-height: 1.6;
  opacity: 0;
  animation: fadeInText 2s ease-in forwards;
  
  @keyframes fadeInText {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const TeamSection = styled.div`
  background-color: #d0e6fd; /* Soft Blue */
  padding: 50px 20px;
  margin-top: 0; /* No gap between sections */
  transition: transform 0.5s ease-in-out;
`;

const TeamGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  opacity: 0;
  animation: fadeUp 1.5s ease-in-out forwards;
  
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(50px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const TeamMember = styled.div`
  background: rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  padding: 20px;
  width: 280px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(10px); /* Glassmorphism effect */

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 3px solid #162660;
    margin-bottom: 10px;
  }

  h4 {
    font-size: 1.5rem;
    color: #162660;
    margin: 10px 0 5px;
  }

  p {
    font-size: 1rem;
    color: #162660;
  }
`;

const About = () => {
  useEffect(() => {
    const aboutText = document.getElementById('about-text');
    const textToType = aboutText.textContent.trim();
    aboutText.textContent = '';

    for (let i = 0; i < textToType.length; i++) {
      setTimeout(() => {
        aboutText.textContent += textToType[i];
      }, 50 * i);
    }
  }, []);

  return (
      <AboutWrapper id="about">
        <AboutSection>
          <Heading>About Us</Heading>
          <AboutText id="about-text">
            At Exdollarium, we're passionate about making exchange services accessible and easy. 
            Founded in 2024, our mission is to provide secure and reliable transactions. 
            With a dedicated team and innovative technology, we aim to enhance the user experience 
            and build trust in every exchange. Join us on our journey to transform the industry.
          </AboutText>
        </AboutSection>
    
        <TeamSection>
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
        </TeamSection>
      </AboutWrapper>
    );    
};

export default About;
