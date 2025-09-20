import React, { useState, useEffect } from "react";
import axios from "axios";

function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all testimonials
  const fetchTestimonials = async () => {
    try {
      setError(null);
      const response = await axios.get("http://localhost:5000/api/testimonials");
      setTestimonials(response.data.data || []);
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      setError("Failed to fetch testimonials");
    }
  };

  // Delete testimonial
  const handleDeleteTestimonial = async (testimonialId) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/testimonials/${testimonialId}`);
      
      // Remove from local state
      setTestimonials(prev => prev.filter(t => t._id !== testimonialId));
      
      alert("Testimonial deleted successfully!");
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      alert("Failed to delete testimonial");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        style={{
          color: index < rating ? '#ffc107' : '#e0e0e0',
          fontSize: '16px'
        }}
      >
        ★
      </span>
    ));
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchTestimonials} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Event Testimonials</h2>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          Manage testimonials from event attendees
        </p>
      </div>

      {testimonials.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
            No testimonials found
          </div>
          <div style={{ fontSize: '14px', color: '#999' }}>
            Testimonials will appear here once attendees start leaving reviews
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            overflowX: 'auto'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '800px'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #e9ecef'
                }}>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#495057',
                    borderRight: '1px solid #e9ecef'
                  }}>
                    Event Title
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#495057',
                    borderRight: '1px solid #e9ecef'
                  }}>
                    Customer Name
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#495057',
                    borderRight: '1px solid #e9ecef'
                  }}>
                    Rating
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#495057',
                    borderRight: '1px solid #e9ecef'
                  }}>
                    Message
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#495057',
                    borderRight: '1px solid #e9ecef'
                  }}>
                    Created At
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#495057'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((testimonial) => (
                  <tr
                    key={testimonial._id}
                    style={{
                      borderBottom: '1px solid #e9ecef',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <td style={{
                      padding: '15px',
                      borderRight: '1px solid #e9ecef',
                      fontWeight: '500',
                      color: '#2c3e50'
                    }}>
                      {testimonial.eventId?.eventTitle || 'Unknown Event'}
                    </td>
                    <td style={{
                      padding: '15px',
                      borderRight: '1px solid #e9ecef',
                      color: '#495057'
                    }}>
                      {testimonial.customerName}
                    </td>
                    <td style={{
                      padding: '15px',
                      borderRight: '1px solid #e9ecef',
                      textAlign: 'center'
                    }}>
                      {renderStars(testimonial.rating)}
                    </td>
                    <td style={{
                      padding: '15px',
                      borderRight: '1px solid #e9ecef',
                      color: '#495057',
                      maxWidth: '300px',
                      wordWrap: 'break-word'
                    }}>
                      {testimonial.message.length > 100 
                        ? `${testimonial.message.substring(0, 100)}...` 
                        : testimonial.message
                      }
                    </td>
                    <td style={{
                      padding: '15px',
                      borderRight: '1px solid #e9ecef',
                      color: '#6c757d',
                      fontSize: '14px'
                    }}>
                      {formatDate(testimonial.createdAt)}
                    </td>
                    <td style={{
                      padding: '15px',
                      textAlign: 'center'
                    }}>
                      <button
                        onClick={() => handleDeleteTestimonial(testimonial._id)}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '8px 12px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e8f4fd',
        borderRadius: '8px',
        border: '1px solid #bee5eb'
      }}>
        <div style={{ fontSize: '14px', color: '#0c5460' }}>
          <strong>Total Testimonials:</strong> {testimonials.length}
        </div>
      </div>
    </div>
  );
}

export default TestimonialsTab;
