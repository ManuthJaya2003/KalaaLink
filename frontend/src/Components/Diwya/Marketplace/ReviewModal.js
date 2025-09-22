import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

const ReviewModal = ({ product, onClose, onReviewSubmit }) => {
  const [review, setReview] = useState({
    customerName: '',
    rating: 5,
    comment: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!review.customerName.trim() || !review.comment.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.post('http://localhost:5000/api/reviews', {
        productId: product._id,
        ...review
      });
      
      onReviewSubmit(response.data);
      onClose();
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Error submitting review:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && setReview({ ...review, rating: i })}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return createPortal(
    <div 
      className="modal-overlay"
      onClick={handleBackdropClick}
    >
      <div className="modal-content review-modal">
        <div className="modal-header">
          <h2>Post a Review</h2>
          <button 
            className="modal-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="product-info" style={{ marginBottom: '16px' }}>
            <h3>{product.artType}</h3>
            <p>by {product.artistName}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="customerName">Your Name *</label>
                <input
                  type="text"
                  id="customerName"
                  value={review.customerName}
                  onChange={(e) => setReview({ ...review, customerName: e.target.value })}
                  required
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="form-group">
                <label>Rating *</label>
                <div className="star-rating">
                  {renderStars(review.rating, true)}
                  <span className="rating-text">{review.rating} out of 5 stars</span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="comment">Your Review *</label>
                <textarea
                  id="comment"
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  required
                  placeholder="Share your thoughts about this artwork..."
                  rows="3"
                  style={{ minHeight: '80px', maxHeight: '100px', resize: 'vertical' }}
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
            </div>
            
            <div className="form-actions" style={{ 
              display: 'flex', 
              gap: '16px', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginTop: '16px', 
              marginBottom: '0px',
              width: '100%',
              height: '50px'
            }}>
              <button 
                type="button" 
                onClick={onClose}
                className="review-cancel-btn"
                style={{ 
                  background: 'black !important', 
                  color: 'white !important', 
                  border: 'none !important',
                  padding: '0 !important',
                  borderRadius: '8px !important',
                  cursor: 'pointer !important',
                  fontSize: '14px !important',
                  fontWeight: '600 !important',
                  width: '140px !important',
                  height: '50px !important',
                  display: 'flex !important',
                  alignItems: 'center !important',
                  justifyContent: 'center !important',
                  boxSizing: 'border-box !important',
                  lineHeight: '1 !important',
                  margin: '0 !important',
                  outline: 'none !important',
                  transition: 'all 0.2s ease !important',
                  flex: '0 0 140px !important'
                }}
                onMouseEnter={(e) => {
                  e.target.style.setProperty('background', '#333333', 'important');
                  e.target.style.setProperty('transform', 'translateY(-2px)', 'important');
                }}
                onMouseLeave={(e) => {
                  e.target.style.setProperty('background', 'black', 'important');
                  e.target.style.setProperty('transform', 'translateY(0)', 'important');
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="review-submit-btn"
                style={{
                  background: '#C1A37F !important',
                  color: 'black !important',
                  border: 'none !important',
                  padding: '0 !important',
                  borderRadius: '8px !important',
                  cursor: 'pointer !important',
                  fontSize: '14px !important',
                  fontWeight: '600 !important',
                  width: '140px !important',
                  height: '50px !important',
                  display: 'flex !important',
                  alignItems: 'center !important',
                  justifyContent: 'center !important',
                  boxSizing: 'border-box !important',
                  lineHeight: '1 !important',
                  margin: '0 !important',
                  outline: 'none !important',
                  transition: 'all 0.2s ease !important',
                  flex: '0 0 140px !important'
                }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.setProperty('background', 'black', 'important');
                    e.target.style.setProperty('color', 'white', 'important');
                    e.target.style.setProperty('transform', 'translateY(-2px)', 'important');
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.setProperty('background', '#C1A37F', 'important');
                    e.target.style.setProperty('color', 'black', 'important');
                    e.target.style.setProperty('transform', 'translateY(0)', 'important');
                  }
                }}
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReviewModal;
