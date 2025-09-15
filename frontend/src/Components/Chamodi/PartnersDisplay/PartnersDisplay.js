import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PartnersDisplay.css';

function PartnersDisplay() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <div className="partners-display">
      <h2>Our Partners & Supporters</h2>
      
      {/* Partners Grid */}
      <div className="partners-grid">
        {partners.map((partner) => (
          <div key={partner._id} className="partner-card">
            <div className="partner-logo">
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
            <div className="partner-info">
              <h3>{partner.organizationName}</h3>
              <p className="partner-message">
                {partner.message.length > 100 
                  ? `${partner.message.substring(0, 100)}...` 
                  : partner.message
                }
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Supporters Carousel */}
      <div className="supporters-section">
        <h3>What Our Supporters Say</h3>
        <div className="supporters-carousel">
          {partners.slice(0, 3).map((partner) => (
            <div key={`supporter-${partner._id}`} className="supporter-card">
              <div className="supporter-quote">
                <p>"{partner.message}"</p>
              </div>
              <div className="supporter-info">
                <strong>{partner.organizationName}</strong>
                <span>{partner.contactName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PartnersDisplay;
