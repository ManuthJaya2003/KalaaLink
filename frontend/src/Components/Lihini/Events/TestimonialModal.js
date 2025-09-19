import React, { useState, useEffect } from "react";
import axios from "axios";

function TestimonialModal({ isOpen, onClose, eventId, onTestimonialSubmitted }) {
  const [formData, setFormData] = useState({
    eventId: eventId || "",
    customerName: "",
    rating: 5,
    message: ""
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch events for dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/events");
        setEvents(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  // Update form data when eventId prop changes
  useEffect(() => {
    if (eventId) {
      setFormData(prev => ({ ...prev, eventId }));
    }
  }, [eventId]);

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
    
    if (!formData.eventId || !formData.customerName.trim() || !formData.message.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `http://localhost:5000/api/events/${formData.eventId}/testimonials`,
        {
          customerName: formData.customerName.trim(),
          rating: parseInt(formData.rating),
          message: formData.message.trim()
        }
      );

      if (response.data.success) {
        // Reset form
        setFormData({
          eventId: eventId || "",
          customerName: "",
          rating: 5,
          message: ""
        });
        
        // Notify parent component
        if (onTestimonialSubmitted) {
          onTestimonialSubmitted(response.data.data);
        }
        
        // Close modal
        onClose();
        
        alert("Thank you for your testimonial!");
      }
    } catch (err) {
      console.error("Error submitting testimonial:", err);
      setError(err.response?.data?.message || "Failed to submit testimonial. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => handleRatingChange(index + 1)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          color: index < formData.rating ? '#ffc107' : '#e0e0e0',
          cursor: 'pointer',
          padding: '0',
          margin: '0 2px',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (index < formData.rating) return;
          e.target.style.color = '#ffc107';
        }}
        onMouseLeave={(e) => {
          if (index < formData.rating) return;
          e.target.style.color = '#e0e0e0';
        }}
      >
        ★
      </button>
    ));
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '500px',
        width: '100%',
        height: '650px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h2 style={{
            margin: 0,
            color: '#2c3e50',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Leave a Testimonial
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              marginBottom: '4px',
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              Select Event *
            </label>
            <select
              name="eventId"
              value={formData.eventId}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e8ed',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Choose an event...</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.eventTitle} - {new Date(event.eventDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              marginBottom: '4px',
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              Your Name *
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e8ed',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              marginBottom: '4px',
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              Rating *
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {renderStars()}
              <span style={{
                color: '#666',
                fontSize: '14px',
                marginLeft: '10px'
              }}>
                {formData.rating} out of 5 stars
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              marginBottom: '4px',
              fontWeight: '500',
              color: '#2c3e50'
            }}>
              Your Testimonial *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              placeholder="Share your experience at this event..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e8ed',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                minHeight: '100px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '5px',
              textAlign: 'right'
            }}>
              {formData.message.length}/500 characters
            </div>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '8px',
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '10px',
            paddingTop: '0',
            backgroundColor: 'transparent',
            padding: '0',
            margin: '0',
            borderRadius: '0',
            width: '100%',
            flexShrink: 0,
            position: 'relative',
            zIndex: 10,
            height: '40px',
            visibility: 'visible',
            opacity: 1
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: '2px solid #000000',
                borderRadius: '8px',
                backgroundColor: '#000000',
                background: '#000000',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.3s ease',
                flex: 1,
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                textTransform: 'none',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                visibility: 'visible',
                position: 'relative',
                zIndex: 1000,
                backgroundImage: 'none',
                backgroundGradient: 'none',
                alignSelf: 'flex-end'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.color = '#000000';
                  e.target.style.borderColor = '#ffffff';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#000000';
                  e.target.style.color = '#ffffff';
                  e.target.style.borderColor = '#000000';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: '2px solid #C1A37F',
                borderRadius: '8px',
                backgroundColor: loading ? '#6c757d' : '#C1A37F',
                background: loading ? '#6c757d' : '#C1A37F',
                color: loading ? '#ffffff' : '#000000',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                flex: 1,
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                textTransform: 'none',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                visibility: 'visible',
                position: 'relative',
                zIndex: 1000,
                backgroundImage: 'none',
                backgroundGradient: 'none',
                alignSelf: 'flex-end'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#000000';
                  e.target.style.color = '#ffffff';
                  e.target.style.borderColor = '#000000';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#C1A37F';
                  e.target.style.color = '#000000';
                  e.target.style.borderColor = '#C1A37F';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                }
              }}
            >
              {loading ? 'Submitting...' : 'Submit Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TestimonialModal;
