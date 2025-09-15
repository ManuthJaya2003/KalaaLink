import React, { useState } from 'react';
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

  return (
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
          <div className="product-info">
            <h3>{product.artType}</h3>
            <p>by {product.artistName}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="review-form">
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
                rows="4"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
