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
          fontSize: '18px',
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    }}>
      {testimonials.map((testimonial) => (
        <div
          key={testimonial._id}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          {/* Header with name and rating */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '15px'
          }}>
            <div>
              <h4 style={{
                margin: '0 0 5px 0',
                color: '#2c3e50',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                {testimonial.customerName}
              </h4>
              {!eventId && testimonial.eventId?.eventTitle && (
                <div style={{ fontSize: '12px', color: '#007bff', marginBottom: '3px', fontWeight: '500' }}>
                  {testimonial.eventId.eventTitle}
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                {formatDate(testimonial.createdAt)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {renderStars(testimonial.rating)}
            </div>
          </div>

          {/* Message */}
          <div style={{
            color: '#495057',
            lineHeight: '1.6',
            fontSize: '14px'
          }}>
            "{testimonial.message}"
          </div>
        </div>
      ))}
    </div>
  );
}

export default EventTestimonials;
