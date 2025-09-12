import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ArtistReviewsDisplay.css';

function ArtistReviewsDisplay({ artistId, artist, onViewMoreReviews }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/artist-reviews/artist/${artistId}`);
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (artistId) {
      fetchReviews();
    }
  }, [artistId]);

  const StarRating = ({ rating }) => {
    return (
      <div className="reviews-star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`reviews-star ${star <= rating ? 'filled' : ''}`}
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

  const mostRecentReview = reviews.length > 0 ? reviews[0] : null;

  if (loading) {
    return (
      <div className="artist-reviews-section">
        <div className="reviews-loading">
          <div className="loading-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="artist-reviews-section">
        <div className="reviews-error">
          <p>{error}</p>
          <button onClick={fetchReviews} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="artist-reviews-section">
        <div className="reviews-empty">
          <div className="empty-icon">💬</div>
          <p>No reviews yet. Be the first to review this artist!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="artist-reviews-section">
      <div className="reviews-header">
        <h4 className="reviews-title">
          Customer Reviews ({reviews.length})
        </h4>
        {reviews.length > 1 && (
          <button 
            className="show-more-btn"
            onClick={() => onViewMoreReviews(artist)}
          >
            View More Reviews ({reviews.length})
          </button>
        )}
      </div>
      
      {mostRecentReview && (
        <div className="reviews-list">
          <div className="review-item">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {mostRecentReview.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="reviewer-details">
                  <h5 className="reviewer-name">{mostRecentReview.customerName}</h5>
                  <span className="review-date">{formatDate(mostRecentReview.createdAt)}</span>
                </div>
              </div>
              <div className="review-rating">
                <StarRating rating={mostRecentReview.rating} />
              </div>
            </div>
            
            <div className="review-content">
              <p className="review-text">"{mostRecentReview.reviewText}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArtistReviewsDisplay;
