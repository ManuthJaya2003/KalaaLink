import React, { useState } from 'react';
import axios from 'axios';
import './TestimonialForm.css';

function TestimonialForm({ events, onTestimonialAdded }) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    attendeeName: '',
    eventId: '',
    rating: 0,
    feedback: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.attendeeName.trim() || !formData.eventId || !formData.rating || !formData.feedback.trim()) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedEvent = events.find(event => event._id === formData.eventId);
      
      const response = await axios.post('http://localhost:5000/testimonials', {
        attendeeName: formData.attendeeName.trim(),
        eventId: formData.eventId,
        eventTitle: selectedEvent?.eventTitle || 'Unknown Event',
        rating: formData.rating,
        feedback: formData.feedback.trim()
      });

      if (response.data.testimonial) {
        showMessage('Testimonial submitted successfully!', 'success');
        setFormData({
          attendeeName: '',
          eventId: '',
          rating: 0,
          feedback: ''
        });
        setIsFormVisible(false);
        
        // Notify parent component to refresh testimonials
        if (onTestimonialAdded) {
          onTestimonialAdded(response.data.testimonial);
        }
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      showMessage('Failed to submit testimonial. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, interactive = true }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onRatingChange(star)}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="testimonial-section">
      <div className="testimonial-header">
        <h3 className="testimonial-title">Share Your Experience</h3>
        <p className="testimonial-subtitle">Help others by sharing your feedback about events you've attended</p>
      </div>

      {!isFormVisible ? (
        <button 
          className="testimonial-toggle-btn"
          onClick={() => setIsFormVisible(true)}
        >
          ✨ Leave a Testimonial
        </button>
      ) : (
        <div className="testimonial-form-container">
          <form onSubmit={handleSubmit} className="testimonial-form">
            <div className="form-group">
              <label htmlFor="attendeeName" className="form-label">
                Your Name *
              </label>
              <input
                type="text"
                id="attendeeName"
                name="attendeeName"
                value={formData.attendeeName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventId" className="form-label">
                Event *
              </label>
              <select
                id="eventId"
                name="eventId"
                value={formData.eventId}
                onChange={handleInputChange}
                className="form-select"
                required
                disabled={isSubmitting}
              >
                <option value="">Select an event</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.eventTitle} - {new Date(event.eventDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Rating *
              </label>
              <StarRating 
                rating={formData.rating} 
                onRatingChange={handleRatingChange}
                interactive={!isSubmitting}
              />
              <span className="rating-text">
                {formData.rating > 0 ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}` : 'Select a rating'}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="feedback" className="form-label">
                Your Feedback *
              </label>
              <textarea
                id="feedback"
                name="feedback"
                value={formData.feedback}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Share your experience and thoughts about the event..."
                rows={4}
                required
                disabled={isSubmitting}
              />
            </div>

            {message && (
              <div className={`form-message ${messageType}`}>
                {message}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default TestimonialForm;
