// src/components/FAQ.js

import React, { useState } from 'react';
import '../styles/FAQ.css'; // Importing custom styles

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "What services do you offer?",
      answer: "We offer a range of services including web development, graphic design, and digital marketing.",
    },
    {
      question: "How can I contact support?",
      answer: "You can contact support via email at support@example.com or call us at +123456789.",
    },
    // Add more FAQ items as needed
  ];

  return (
    <section id="faq" className="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqData.map((faq, index) => (
          <div key={index} className="faq-item">
            <div className="faq-question" onClick={() => toggleFAQ(index)}>
              {faq.question}
              <span className={`arrow ${activeIndex === index ? 'open' : ''}`}>▼</span>
            </div>
            {activeIndex === index && (
              <div className="faq-answer">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
