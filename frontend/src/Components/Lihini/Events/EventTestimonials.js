import React, { useState, useEffect } from "react";
import axios from "axios";

function EventTestimonials({ eventId }) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch testimonials for the specific event or all testimonials
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      if (eventId) {
        response = await axios.get(`http://localhost:5000/api/events/${eventId}/testimonials`);
      } else {
        response = await axios.get(`http://localhost:5000/api/testimonials`);
      }
      setTestimonials(response.data.data || []);
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      setError("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [eventId]);

  // Render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        style={{
          color: index < rating ? '#ffc107' : '#e0e0e0',
          fontSize: '16px',
          marginRight: '2px'
        }}
      >
        ★
      </span>
    ));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ color: '#666' }}>Loading testimonials...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ color: '#e74c3c' }}>{error}</div>
        <button
          onClick={fetchTestimonials}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: '#666',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>
          No testimonials yet
        </div>
        <div style={{ fontSize: '14px' }}>
          Be the first to share your experience!
        </div>
      </div>
    );
  }

  return (
    <>
      {testimonials.map((testimonial) => (
        <div
          key={testimonial._id}
          style={{
            flex: '0 0 350px',
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            border: '2px solid transparent',
            minHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* Event Name - Normal page text */}
          {!eventId && testimonial.eventId?.eventTitle && (
            <div style={{ 
              fontSize: '0.9rem', 
              color: 'rgba(193, 163, 127, 0.8)', 
              fontWeight: '500', 
              marginBottom: '15px',
              textAlign: 'left'
            }}>
              {testimonial.eventId.eventTitle}
            </div>
          )}

          {/* Message */}
          <div style={{
            color: '#000000',
            lineHeight: '1.6',
            fontSize: '1.1rem',
            marginBottom: '25px',
            fontStyle: 'italic',
            flex: 1
          }}>
            {testimonial.message}
          </div>

          {/* Author section */}
          <div style={{
            paddingTop: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '5px'
                }}>
                  {testimonial.customerName}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(193, 163, 127, 0.8)', fontWeight: '500' }}>
                  {formatDate(testimonial.createdAt)}
                </div>
              </div>
              <div>
                {renderStars(testimonial.rating)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default EventTestimonials;
