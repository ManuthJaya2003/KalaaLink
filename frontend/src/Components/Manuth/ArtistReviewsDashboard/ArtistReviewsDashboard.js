import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ArtistReviewsDashboard.css';

function ArtistReviewsDashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/artist-reviews');
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Error fetching artist reviews:', err);
      setError('Failed to load artist reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setDeletingId(reviewId);
      await axios.delete(`http://localhost:5000/artist-reviews/${reviewId}`);
      
      // Remove the deleted review from the state
      setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
      
      // Show success message
      alert('Review deleted successfully!');
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="dashboard-star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`dashboard-star ${star <= rating ? 'filled' : ''}`}
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If the path already includes "/uploads/", use it as is
    if (imagePath.startsWith("/uploads/")) {
      return `http://localhost:5000${imagePath}`;
    }
    
    // Otherwise, construct the URL with the uploads prefix
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="artist-reviews-dashboard">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Artist Reviews Management</h2>
          <p className="dashboard-subtitle">Manage customer reviews for all artists</p>
        </div>
        
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="artist-reviews-dashboard">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Artist Reviews Management</h2>
          <p className="dashboard-subtitle">Manage customer reviews for all artists</p>
        </div>
        
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchReviews} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="artist-reviews-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Artist Reviews Management</h2>
        <p className="dashboard-subtitle">
          Manage customer reviews for all artists ({reviews.length} total reviews)
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No Reviews Yet</h3>
          <p>Customer reviews will appear here once artists start receiving feedback.</p>
        </div>
      ) : (
        <div className="reviews-table-container">
          <div className="table-responsive">
            <table className="reviews-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Artist</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id} className="review-row">
                    <td className="customer-cell">
                      <div className="customer-info">
                        <div className="customer-avatar">
                          {review.customerName.charAt(0).toUpperCase()}
                        </div>
                        <span className="customer-name">{review.customerName}</span>
                      </div>
                    </td>
                    <td className="artist-cell">
                      <div className="artist-info">
                        <div className="artist-avatar">
                          {review.artistName.charAt(0).toUpperCase()}
                        </div>
                        <span className="artist-name">{review.artistName}</span>
                      </div>
                    </td>
                    <td className="rating-cell">
                      <StarRating rating={review.rating} />
                    </td>
                    <td className="review-cell">
                      <div className="review-text">
                        "{review.reviewText}"
                      </div>
                    </td>
                    <td className="date-cell">
                      <span className="review-date">{formatDate(review.createdAt)}</span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteReview(review._id)}
                        disabled={deletingId === review._id}
                      >
                        {deletingId === review._id ? 'Deleting...' : '🗑️ Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArtistReviewsDashboard;
