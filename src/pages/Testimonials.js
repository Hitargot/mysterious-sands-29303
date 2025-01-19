// src/pages/Testimonials.js
import React, { useState } from 'react';
import '../styles/Testimonials.css'; // Optional: Include a CSS file for styling
import TestimonialsHeader from '../components/TestimonialsHeader'; // Import the new header


const Testimonials = () => {
  const [feedback, setFeedback] = useState({
    name: '',
    service: '',
    review: '',
  });

  const [testimonials, setTestimonials] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback({
      ...feedback,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add new testimonial to the testimonials array
    setTestimonials([...testimonials, feedback]);
    // Clear the form
    setFeedback({ name: '', service: '', review: '' });
  };

  return (
    <div>
      <TestimonialsHeader />
      <h1>Testimonials</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={feedback.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="service">Service:</label>
          <input
            type="text"
            id="service"
            name="service"
            value={feedback.service}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="review">Review:</label>
          <textarea
            id="review"
            name="review"
            value={feedback.review}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit">Submit Feedback</button>
      </form>

      <div>
        <h2>User Feedback</h2>
        {testimonials.length > 0 ? (
          testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial">
              <h3>{testimonial.name}</h3>
              <p><strong>Service:</strong> {testimonial.service}</p>
              <p>{testimonial.review}</p>
            </div>
          ))
        ) : (
          <p>No testimonials yet. Be the first to leave one!</p>
        )}
      </div>
    </div>
  );
};

export default Testimonials;
