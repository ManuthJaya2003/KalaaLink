import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StarRating from '../../Common/StarRating';
import MainNav from '../../MainNav/MainNav';
import ArtistNav from '../ArtistNav/ArtistNav';
import './ArtistDashboardReviews.css';

const ArtistDashboardReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [artist, setArtist] = useState(null);
  const [likedReviews, setLikedReviews] = useState(new Set());
  const [deletingReview, setDeletingReview] = useState(null);

  useEffect(() => {
    fetchArtistAndReviews();
  }, []);

  const fetchArtistAndReviews = async () => {
    try {
      setLoading(true);
      setError('');

      // Get the logged-in artist
      const storedArtist = JSON.parse(localStorage.getItem("artist"));
      if (!storedArtist) {
        setError('Artist not found. Please log in again.');
        return;
      }

      setArtist(storedArtist);
      const artistId = storedArtist.id || storedArtist._id;

      // Fetch reviews for this specific artist
      const response = await axios.get(`http://localhost:5000/api/artist-reviews/${artistId}`);
      
      if (response.data.success) {
        setReviews(response.data.reviews);
      } else {
        setError(response.data.message || 'Failed to fetch reviews.');
      }
    } catch (err) {
      console.error('Error fetching artist reviews:', err);
      setError('An error occurred while fetching reviews.');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    try {
      // Toggle like status locally for immediate UI feedback
      setLikedReviews(prev => {
        const newLiked = new Set(prev);
        if (newLiked.has(reviewId)) {
          newLiked.delete(reviewId);
        } else {
          newLiked.add(reviewId);
        }
        return newLiked;
      });

      // Here you would typically make an API call to save the like
      // For now, we'll just update the local state
      console.log(`Toggled like for review ${reviewId}`);
    } catch (err) {
      console.error('Error liking review:', err);
      // Revert the like status on error
      setLikedReviews(prev => {
        const newLiked = new Set(prev);
        newLiked.delete(reviewId);
        return newLiked;
      });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingReview(reviewId);
      
      const response = await axios.delete(`http://localhost:5000/api/artist-reviews/${reviewId}`);
      
      if (response.data.success) {
        // Remove the review from the local state
        setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
        
        // Show success message (you could add a toast notification here)
        console.log('Review deleted successfully');
      } else {
        setError(response.data.message || 'Failed to delete review.');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      setError(err.response?.data?.message || 'An error occurred while deleting the review.');
    } finally {
      setDeletingReview(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div>
        <MainNav />
        <ArtistNav />
        <div className="artist-dashboard-reviews">
          <div className="reviews-header">
            <h2>My Reviews</h2>
            <p>Loading your reviews...</p>
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <MainNav />
        <ArtistNav />
        <div className="artist-dashboard-reviews">
          <div className="reviews-header">
            <h2>My Reviews</h2>
          </div>
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="btn btn-primary" onClick={fetchArtistAndReviews}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MainNav />
      <ArtistNav />
      <div className="artist-dashboard-reviews">
      <div className="reviews-header">
        <h2>My Reviews</h2>
        <p>Reviews from customers about your performances</p>
        <div className="reviews-stats">
          <span className="total-reviews">{reviews.length} Review{reviews.length !== 1 ? 's' : ''}</span>
          {reviews.length > 0 && (
            <span className="average-rating">
              Average: {(
                reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
              ).toFixed(1)} ⭐
            </span>
          )}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="no-reviews-container">
          <div className="no-reviews-icon">⭐</div>
          <h3>No reviews yet</h3>
          <p>Reviews from customers will appear here once they start posting them.</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="reviewer-details">
                    <h4 className="reviewer-name">{review.customerName}</h4>
                    <div className="review-rating">
                      <StarRating rating={review.rating} size="small" />
                    </div>
                  </div>
                </div>
                <div className="review-actions">
                  <button
                    className={`action-btn like-btn ${likedReviews.has(review._id) ? 'liked' : ''}`}
                    onClick={() => handleLikeReview(review._id)}
                    title="Like this review"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteReview(review._id)}
                    disabled={deletingReview === review._id}
                    title="Delete this review"
                  >
                    {deletingReview === review._id ? (
                      <div className="loading-spinner-small"></div>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="review-content">
                <p className="review-text">"{review.review}"</p>
              </div>
              
              <div className="review-footer">
                <span className="review-date">{formatDate(review.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default ArtistDashboardReviews;
