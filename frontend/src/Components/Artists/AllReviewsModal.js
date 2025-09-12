import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllReviewsModal.css';

function AllReviewsModal({ artist, isOpen, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/artist-reviews/artist/${artist._id}`);
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && artist) {
      fetchReviews();
    }
  }, [isOpen, artist]);

  const StarRating = ({ rating }) => {
    return (
      <div className="all-reviews-star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`all-reviews-star ${star <= rating ? 'filled' : ''}`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="all-reviews-modal-overlay" onClick={onClose}>
      <div className="all-reviews-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="all-reviews-modal-header">
          <div className="all-reviews-header-info">
            <h2 className="all-reviews-modal-title">
              All Reviews for {artist.artistName}
            </h2>
            <p className="all-reviews-count">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="all-reviews-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="all-reviews-modal-body">
          {loading ? (
            <div className="all-reviews-loading">
              <div className="loading-spinner"></div>
              <p>Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="all-reviews-error">
              <p>{error}</p>
              <button onClick={fetchReviews} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="all-reviews-empty">
              <div className="empty-icon">💬</div>
              <p>No reviews yet for this artist.</p>
            </div>
          ) : (
            <div className="all-reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="all-reviews-item">
                  <div className="all-reviews-item-header">
                    <div className="all-reviews-customer-info">
                      <div className="all-reviews-customer-avatar">
                        {review.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="all-reviews-customer-details">
                        <h4 className="all-reviews-customer-name">{review.customerName}</h4>
                        <span className="all-reviews-date">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                    <div className="all-reviews-rating">
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  
                  <div className="all-reviews-content">
                    <p className="all-reviews-text">"{review.reviewText}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllReviewsModal;
