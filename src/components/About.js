// src/components/About.js

import React, { useEffect } from 'react';
import '../styles/About.css'; // Optional: Include a CSS file for styling
import johnDoeImg from '../assets/images/path_to_team_member_image1.jpg'; // Adjust path as necessary
import janeSmithImg from '../assets/images/path_to_team_member_image.jpg'; // Adjust path as necessary
import aliceJohnsonImg from '../assets/images/path_to_team_member_image1.jpg'; // Adjust path as necessary

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

// Rest of your About component code


const About = () => {
  useEffect(() => {
    // Typing effect for about text
    const aboutText = document.getElementById('about-text');
    const textToType = aboutText.textContent.trim(); // Get text content and trim whitespace
    aboutText.textContent = ''; // Clear text content initially

    // Loop through each character and append it with a delay for typing effect
    for (let i = 0; i < textToType.length; i++) {
      (function(i) {
        setTimeout(function() {
          aboutText.textContent += textToType[i];
        }, 50 * i); // Adjust speed of typing here (50 milliseconds per character)
      })(i);
    }
  }, []);

  return (
    <section id="about" className="about-section">
      <h2>About Us</h2>
      <p id="about-text">
        At Exdollarium, we're passionate about making exchange services accessible and easy. 
        Founded in 2024, our mission is to provide secure and reliable transactions. 
        With a dedicated team and innovative technology, we aim to enhance the user experience and 
        build trust in every exchange. Join us on our journey to transform the industry.
      </p>
      
      <h3>Meet Our Team</h3>
      <div className="team-members">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-member">
            <img src={member.image} alt={member.name} />
            <h4>{member.name}</h4>
            <p>{member.position}</p>
            <p>{member.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default About;
