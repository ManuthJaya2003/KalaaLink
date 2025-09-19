import React from 'react';
import { createPortal } from 'react-dom';

const ReviewsModal = ({ product, reviews, onClose }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  return createPortal(
    <div 
      className="modal-overlay"
      onClick={handleBackdropClick}
    >
      <div className="modal-content reviews-modal">
        <div className="modal-header">
          <h2>Customer Reviews</h2>
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
            
            {reviews.length > 0 && (
              <div className="average-rating">
                <div className="stars">
                  {renderStars(Math.round(calculateAverageRating()))}
                </div>
                <span className="rating-text">
                  {calculateAverageRating()} out of 5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}
          </div>
          
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <h4>{review.customerName}</h4>
                      <div className="stars">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <p>No reviews yet for this product.</p>
                <p>Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReviewsModal;
