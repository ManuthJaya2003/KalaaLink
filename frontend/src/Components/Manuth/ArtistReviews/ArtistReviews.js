import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StarRating from '../../Common/StarRating';
import MainNav from '../../MainNav/MainNav';
import ArtistManagerNav from '../ArtistManagerNav/ArtistManagerNav';
import './ArtistReviews.css';
import '../Overview/AnalyticsTab.css';

const ArtistReviews = ({ showNavigation = true }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleClearAllReviews = async () => {
    setIsClearingAll(true);
    
    try {
      const response = await axios.delete('http://localhost:5000/api/artist-reviews/clear-all');
      
      if (response.data.success) {
        // Clear all reviews from the list
        setReviews([]);
        setClearAllConfirm(false);
        setError('');
      } else {
        setError('Failed to clear all reviews');
      }
    } catch (err) {
      console.error('Error clearing all reviews:', err);
      setError('Failed to clear all reviews. Please try again.');
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleExportReviews = async () => {
    setIsExporting(true);
    
    try {
      const response = await axios.get('http://localhost:5000/api/artist-reviews/export', {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `artist-reviews-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting reviews:', err);
      setError('Failed to export reviews. Please try again.');
    } finally {
      setIsExporting(false);
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
        <div className="analytics-page-header">
          <div>
            <h1 className="analytics-page-title">Artist Reviews Management</h1>
            <p className="analytics-page-subtitle">Manage all artist reviews and ratings</p>
          </div>
          <div className="reviews-header-actions">
            <button 
              className="btn btn-export" 
              onClick={handleExportReviews}
              disabled={isExporting || reviews.length === 0}
            >
              {isExporting ? 'Exporting...' : 'Export Reviews'}
            </button>
            <button 
              className="btn btn-clear-all" 
              onClick={() => setClearAllConfirm(true)}
              disabled={isClearingAll || reviews.length === 0}
            >
              {isClearingAll ? 'Clearing...' : 'Clear All Reviews'}
            </button>
            <button className="btn btn-refresh" onClick={fetchReviews}>
              Refresh
            </button>
          </div>
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
                    {review.artist?.artistName || 'Unknown Artist'}
                    <div className="artist-details">
                      {review.artist?.genre || 'N/A'} • {review.artist?.category || 'N/A'}
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
                      className="btn btn-danger"
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

      {/* Clear All Reviews Confirmation Modal */}
      {clearAllConfirm && (
        <div className="delete-modal-overlay" onClick={() => setClearAllConfirm(false)}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>Clear All Reviews</h3>
              <button 
                className="delete-modal-close" 
                onClick={() => setClearAllConfirm(false)}
                disabled={isClearingAll}
              >
                ×
              </button>
            </div>
            
            <div className="delete-modal-body">
              <p>Are you sure you want to clear all artist reviews? This action cannot be undone.</p>
              <p className="warning-text">
                <strong>Warning:</strong> This will permanently delete all {reviews.length} review{reviews.length !== 1 ? 's' : ''} from the database.
              </p>
            </div>
            
            <div className="delete-modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setClearAllConfirm(false)}
                disabled={isClearingAll}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleClearAllReviews}
                disabled={isClearingAll}
              >
                {isClearingAll ? 'Clearing All Reviews...' : 'Clear All Reviews'}
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
