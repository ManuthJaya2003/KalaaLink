import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './PartnersDisplay.css';

function PartnersDisplay() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTestimonial, setExpandedTestimonial] = useState(null);
  
  // Refs for carousel functionality
  const partnersTrackRef = useRef(null);
  const testimonialsRef = useRef(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    fetchApprovedPartners();
  }, []);

  const fetchApprovedPartners = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/partnerships/approved');
      setPartners(response.data.partnershipRequests || []);
    } catch (error) {
      console.error('Error fetching approved partners:', error);
      setError('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  // Partners floating animation - no manual scrolling needed
  useEffect(() => {
    const partnersTrack = partnersTrackRef.current;
    if (!partnersTrack) return;

    // Create floating animation
    const animatePartners = () => {
      partnersTrack.style.animation = 'none';
      void partnersTrack.offsetHeight; // Trigger reflow
      partnersTrack.style.animation = 'floatPartners 30s linear infinite';
    };

    animatePartners();
  }, [partners]);

  // Testimonials scroll function - matching Impact Stories functionality
  const scrollTestimonials = (direction) => {
    const slider = testimonialsRef.current;
    if (!slider) return;
    
    const cardWidth = 350; // Width of each testimonial card
    const gap = 30; // Gap between cards
    const scrollAmount = cardWidth + gap;
    
    if (direction === 'next') {
      setCurrentTestimonial(prev => prev + 1);
      slider.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    } else {
      setCurrentTestimonial(prev => Math.max(prev - 1, 0));
      slider.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const toggleExpanded = (testimonialId) => {
    setExpandedTestimonial(expandedTestimonial === testimonialId ? null : testimonialId);
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="partners-display">
        <div className="loading">Loading partners...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="partners-display">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="partners-display">
        <h2>Our Partners & Supporters</h2>
        <div className="no-partners">
          <p>We're working on building partnerships. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Partners Horizontal Container - Floating Animation */}
      <div className="partners-horizontal-container">
        <div className="partners-header">
          <h2 className="partners-title">Our Partners & Supporters</h2>
          <p className="partners-subtitle">Discover the amazing organizations that support our mission and help us make a difference in the community</p>
        </div>
        
        <div className="partners-floating-container">
          <div className="partners-track" ref={partnersTrackRef}>
            {partners.map((partner) => (
              <div key={partner._id} className="partner-logo">
                {partner.logo ? (
                  <img 
                    src={partner.logo} 
                    alt={`${partner.organizationName} logo`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="logo-placeholder" style={{ display: partner.logo ? 'none' : 'flex' }}>
                  <span>{partner.organizationName.charAt(0).toUpperCase()}</span>
                </div>
              </div>
            ))}
            {/* Duplicate logos for seamless loop */}
            {partners.map((partner) => (
              <div key={`duplicate-${partner._id}`} className="partner-logo">
                {partner.logo ? (
                  <img 
                    src={partner.logo} 
                    alt={`${partner.organizationName} logo`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="logo-placeholder" style={{ display: partner.logo ? 'none' : 'flex' }}>
                  <span>{partner.organizationName.charAt(0).toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supporters Horizontal Container */}
      <div className="supporters-horizontal-container">
        <div className="supporters-header">
          <h3 className="supporters-title">What Our Supporters Say</h3>
          <p className="supporters-subtitle">Hear from our amazing partners and supporters about their experience working with us and the impact we're making together</p>
        </div>
        
        <div className="supporters-wrapper">
          <button 
            className="testimonial-nav-btn testimonial-prev" 
            onClick={() => scrollTestimonials('prev')}
          >
            <span>‹</span>
          </button>
          <div className="supporters-carousel" ref={testimonialsRef}>
            {partners.map((partner) => (
              <div key={`testimonial-${partner._id}`} className="supporter-card">
                <div className="supporter-quote">
                  {expandedTestimonial === partner._id ? (
                    <p>"{partner.message}"</p>
                  ) : (
                    <p>"{truncateText(partner.message)}"</p>
                  )}
                  
                  {partner.message.length > 150 && (
                    <button
                      className="read-more-button"
                      onClick={() => toggleExpanded(partner._id)}
                    >
                      {expandedTestimonial === partner._id ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>
                <div className="supporter-info">
                  <strong>{partner.organizationName}</strong>
                  <span>{partner.contactName}</span>
                </div>
              </div>
            ))}
          </div>
          <button 
            className="testimonial-nav-btn testimonial-next" 
            onClick={() => scrollTestimonials('next')}
          >
            <span>›</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default PartnersDisplay;
