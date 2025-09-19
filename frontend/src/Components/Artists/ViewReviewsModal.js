import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StarRating from '../Common/StarRating';
import './ViewReviewsModal.css';

const ViewReviewsModal = ({ isOpen, onClose, artist }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && artist) {
      fetchReviews();
      fetchAverageRating();
    }
  }, [isOpen, artist]);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`http://localhost:5000/api/artist-reviews/${artist._id}`);
      
      if (response.data.success) {
        setReviews(response.data.reviews);
      } else {
        setError('Failed to load reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/artist-reviews/${artist._id}/average`);
      
      if (response.data.success) {
        setAverageRating(response.data.averageRating);
        setTotalReviews(response.data.totalReviews);
      }
    } catch (err) {
      console.error('Error fetching average rating:', err);
    }
  };

  const handleClose = () => {
    setReviews([]);
    setAverageRating(0);
    setTotalReviews(0);
    setError('');
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen || !artist) return null;

  return (
    <div className="view-reviews-modal-overlay" onClick={handleClose}>
      <div className="view-reviews-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="view-reviews-modal-header">
          <div className="header-info">
            <h2>Reviews for {artist.artistName}</h2>
            {totalReviews > 0 && (
              <div className="rating-summary">
                <StarRating rating={Math.round(averageRating)} size="medium" />
                <span className="rating-text">
                  {averageRating.toFixed(1)} out of 5 ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                </span>
              </div>
            )}
          </div>
          <button className="view-reviews-modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="view-reviews-modal-body">
          {loading ? (
            <div className="loading-container">
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchReviews}>
                Try Again
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="no-reviews-container">
              <div className="no-reviews-icon">⭐</div>
              <h3>No reviews yet</h3>
              <p>Be the first to review {artist.artistName}!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="reviewer-details">
                        <h4>{review.customerName}</h4>
                        <StarRating rating={review.rating} size="small" />
                      </div>
                    </div>
                    <span className="review-date">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <div className="review-content">
                    <p>{review.review}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewReviewsModal;
