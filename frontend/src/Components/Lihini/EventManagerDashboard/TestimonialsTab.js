import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TestimonialsTab.css';

function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      setDeletingId(id);
      await axios.delete(`http://localhost:5000/testimonials/${id}`);
      
      // Remove the testimonial from the local state
      setTestimonials(prev => prev.filter(testimonial => testimonial._id !== id));
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      alert('Failed to delete testimonial. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="admin-star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`admin-star ${star <= rating ? 'filled' : ''}`}
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter out legacy testimonials (those without attendeeName)
  const eventTestimonials = testimonials.filter(testimonial => 
    testimonial.attendeeName && testimonial.eventTitle
  );

  if (loading) {
    return (
      <div className="testimonials-admin">
        <div className="testimonials-admin-header">
          <h2>Testimonials Management</h2>
          <p>Manage attendee feedback and testimonials</p>
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
      <div className="testimonials-admin">
        <div className="testimonials-admin-header">
          <h2>Testimonials Management</h2>
          <p>Manage attendee feedback and testimonials</p>
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

  return (
    <div className="testimonials-admin">
      <div className="testimonials-admin-header">
        <h2>Testimonials Management</h2>
        <p>Manage attendee feedback and testimonials ({eventTestimonials.length} total)</p>
      </div>

      {eventTestimonials.length === 0 ? (
        <div className="testimonials-empty">
          <div className="empty-icon">💬</div>
          <h3>No testimonials yet</h3>
          <p>Testimonials from event attendees will appear here once they start submitting feedback.</p>
        </div>
      ) : (
        <div className="testimonials-table-container">
          <table className="testimonials-table">
            <thead>
              <tr>
                <th>Attendee Name</th>
                <th>Event</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {eventTestimonials.map((testimonial) => (
                <tr key={testimonial._id}>
                  <td className="attendee-name">
                    <div className="attendee-info">
                      <div className="attendee-avatar">
                        {testimonial.attendeeName.charAt(0).toUpperCase()}
                      </div>
                      <span>{testimonial.attendeeName}</span>
                    </div>
                  </td>
                  <td className="event-name">
                    <div className="event-info">
                      <strong>{testimonial.eventTitle}</strong>
                      <small>ID: {testimonial.eventId}</small>
                    </div>
                  </td>
                  <td className="rating-cell">
                    <StarRating rating={testimonial.rating} />
                    <span className="rating-number">({testimonial.rating}/5)</span>
                  </td>
                  <td className="feedback-cell">
                    <div className="feedback-content">
                      "{testimonial.feedback}"
                    </div>
                  </td>
                  <td className="date-cell">
                    {formatDate(testimonial.createdAt)}
                  </td>
                  <td className="action-cell">
                    <button
                      onClick={() => handleDeleteTestimonial(testimonial._id)}
                      className="delete-btn"
                      disabled={deletingId === testimonial._id}
                    >
                      {deletingId === testimonial._id ? 'Deleting...' : '🗑️ Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TestimonialsTab;
