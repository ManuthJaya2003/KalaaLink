import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TestimonialDisplay.css';

function TestimonialDisplay() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/testimonials');
      setTestimonials(response.data.testimonials || []);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const StarRating = ({ rating }) => {
    return (
      <div className="testimonial-star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`testimonial-star ${star <= rating ? 'filled' : ''}`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="testimonials-section">
        <div className="testimonials-header">
          <h3 className="testimonials-title">Attendee Testimonials</h3>
        </div>
        <div className="testimonials-loading">
          <div className="loading-spinner"></div>
          <p>Loading testimonials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="testimonials-section">
        <div className="testimonials-header">
          <h3 className="testimonials-title">Attendee Testimonials</h3>
        </div>
        <div className="testimonials-error">
          <p>{error}</p>
          <button onClick={fetchTestimonials} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Filter out legacy testimonials (those without attendeeName)
  const eventTestimonials = testimonials.filter(testimonial => 
    testimonial.attendeeName && testimonial.eventTitle
  );

  if (eventTestimonials.length === 0) {
    return (
      <div className="testimonials-section">
        <div className="testimonials-header">
          <h3 className="testimonials-title">Attendee Testimonials</h3>
        </div>
        <div className="testimonials-empty">
          <div className="empty-icon">💬</div>
          <p>No testimonials yet. Be the first to share your experience!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="testimonials-section">
      <div className="testimonials-header">
        <h3 className="testimonials-title">Attendee Testimonials</h3>
        <p className="testimonials-subtitle">
          See what others are saying about our events
        </p>
      </div>
      
      <div className="testimonials-grid">
        {eventTestimonials.map((testimonial) => (
          <div key={testimonial._id} className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonial.attendeeName.charAt(0).toUpperCase()}
                </div>
                <div className="author-info">
                  <h4 className="author-name">{testimonial.attendeeName}</h4>
                  <p className="testimonial-event">{testimonial.eventTitle}</p>
                </div>
              </div>
              <div className="testimonial-rating">
                <StarRating rating={testimonial.rating} />
              </div>
            </div>
            
            <div className="testimonial-content">
              <p className="testimonial-feedback">"{testimonial.feedback}"</p>
            </div>
            
            <div className="testimonial-footer">
              <span className="testimonial-date">
                {formatDate(testimonial.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestimonialDisplay;
