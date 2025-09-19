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
          <div className="product-info" style={{ marginBottom: '2px' }}>
            <h3>{product.artType}</h3>
            <p>by {product.artistName}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="review-form" style={{ width: '100%', maxWidth: '500px' }}>
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
                rows="2"
                style={{ minHeight: '50px', maxHeight: '70px' }}
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginTop: '16px', 
              width: '100%',
              height: '48px'
            }}>
              <button 
                type="button" 
                onClick={onClose}
                style={{ 
                  background: '#374151 !important', 
                  color: 'white !important', 
                  border: 'none !important',
                  padding: '0 !important',
                  borderRadius: '6px !important',
                  cursor: 'pointer !important',
                  fontSize: '14px !important',
                  fontWeight: '600 !important',
                  width: '120px !important',
                  height: '48px !important',
                  display: 'flex !important',
                  alignItems: 'center !important',
                  justifyContent: 'center !important',
                  boxSizing: 'border-box !important',
                  lineHeight: '1 !important',
                  margin: '0 !important',
                  outline: 'none !important'
                }}
                onMouseEnter={(e) => {
                  e.target.style.setProperty('background', '#1f2937', 'important');
                }}
                onMouseLeave={(e) => {
                  e.target.style.setProperty('background', '#374151', 'important');
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                style={{
                  background: '#C1A37F !important',
                  color: 'black !important',
                  border: 'none !important',
                  padding: '0 !important',
                  borderRadius: '6px !important',
                  cursor: 'pointer !important',
                  fontSize: '14px !important',
                  fontWeight: '600 !important',
                  width: '140px !important',
                  height: '48px !important',
                  display: 'flex !important',
                  alignItems: 'center !important',
                  justifyContent: 'center !important',
                  boxSizing: 'border-box !important',
                  lineHeight: '1 !important',
                  margin: '0 !important',
                  outline: 'none !important'
                }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.setProperty('background', 'black', 'important');
                    e.target.style.setProperty('color', 'white', 'important');
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.setProperty('background', '#C1A37F', 'important');
                    e.target.style.setProperty('color', 'black', 'important');
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
