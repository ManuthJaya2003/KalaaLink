import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StarRating from '../../Common/StarRating';
import MainNav from '../../MainNav/MainNav';
import ArtistManagerNav from '../ArtistManagerNav/ArtistManagerNav';
import './ArtistReviews.css';

const ArtistReviews = ({ showNavigation = true }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:5000/api/artist-reviews');
      
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

  const handleDeleteReview = async (reviewId) => {
    setIsDeleting(true);
    
    try {
      const response = await axios.delete(`http://localhost:5000/api/artist-reviews/${reviewId}`);
      
      if (response.data.success) {
        // Remove the review from the list
        setReviews(prev => prev.filter(review => review._id !== reviewId));
        setDeleteConfirm(null);
      } else {
        setError('Failed to delete review');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div>
        {showNavigation && <MainNav />}
        {showNavigation && <ArtistManagerNav />}
        <div className="artist-reviews-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {showNavigation && <MainNav />}
        {showNavigation && <ArtistManagerNav />}
        <div className="artist-reviews-container">
          <div className="error-container">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchReviews}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showNavigation && <MainNav />}
      {showNavigation && <ArtistManagerNav />}
      <div className="artist-reviews-container">
      <div className="reviews-header">
        <h2>Artist Reviews Management</h2>
        <p>Manage all artist reviews and ratings</p>
        <button className="btn btn-refresh" onClick={fetchReviews}>
          Refresh
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="no-reviews-container">
          <div className="no-reviews-icon">⭐</div>
          <h3>No reviews yet</h3>
          <p>Reviews will appear here once customers start posting them.</p>
        </div>
      ) : (
        <div className="reviews-table-container">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Artist Name</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id}>
                  <td className="customer-name">
                    <div className="customer-avatar">
                      {(review.customerName || 'U').charAt(0).toUpperCase()}
                    </div>
                    {review.customerName || 'Unknown Customer'}
                  </td>
                  <td className="artist-name">
                    <div className="artist-info">
                      <strong>{review.artist?.artistName || 'Unknown Artist'}</strong>
                      <span className="artist-details">
                        {review.artist?.genre || 'N/A'} • {review.artist?.category || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="rating-cell">
                    <StarRating rating={review.rating || 0} size="small" />
                  </td>
                  <td className="review-text">
                    <div className="review-content">
                      <p>{truncateText(review.review, 100)}</p>
                    </div>
                  </td>
                  <td className="date-cell">
                    {review.createdAt ? formatDate(review.createdAt) : 'Unknown Date'}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-delete"
                      onClick={() => setDeleteConfirm(review)}
                      disabled={isDeleting}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="delete-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>Delete Review</h3>
              <button 
                className="delete-modal-close" 
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
              >
                ×
              </button>
            </div>
            
            <div className="delete-modal-body">
              <p>Are you sure you want to delete this review? This action cannot be undone.</p>
              
              <div className="review-preview">
                <div className="review-preview-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {deleteConfirm.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{deleteConfirm.customerName}</strong>
                      <StarRating rating={deleteConfirm.rating} size="small" />
                    </div>
                  </div>
                  <span className="review-date">
                    {formatDate(deleteConfirm.createdAt)}
                  </span>
                </div>
                <div className="review-preview-content">
                  <p>"{deleteConfirm.review}"</p>
                </div>
              </div>
            </div>
            
            <div className="delete-modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteReview(deleteConfirm._id)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Review'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ArtistReviews;
