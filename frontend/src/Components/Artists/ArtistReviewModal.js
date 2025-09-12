import React, { useState } from 'react';
import axios from 'axios';
import './ArtistReviewModal.css';

function ArtistReviewModal({ artist, isOpen, onClose, onReviewSubmitted }) {
  const [formData, setFormData] = useState({
    customerName: '',
    rating: 0,
    reviewText: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName.trim() || !formData.rating || !formData.reviewText.trim()) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/artist-reviews', {
        artistId: artist._id,
        artistName: artist.artistName,
        customerName: formData.customerName.trim(),
        rating: formData.rating,
        reviewText: formData.reviewText.trim()
      });

      if (response.data.review) {
        showMessage('Review submitted successfully!', 'success');
        setFormData({
          customerName: '',
          rating: 0,
          reviewText: ''
        });
        
        // Notify parent component to refresh reviews
        if (onReviewSubmitted) {
          onReviewSubmitted(response.data.review);
        }
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showMessage('Failed to submit review. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, interactive = true }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onRatingChange(star)}
          >
            ⭐
          </span>
        ))}
      </div>
    );
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

  if (!isOpen) return null;

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <div className="artist-info">
            <div className="artist-avatar">
              {artist.profilePic ? (
                <img 
                  src={getImageUrl(artist.profilePic)} 
                  alt={artist.artistName}
                  className="artist-profile-image"
                />
              ) : (
                <div className="artist-initials">
                  {artist.artistName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="artist-details">
              <h3 className="artist-name">{artist.artistName}</h3>
              <p className="artist-genre">{artist.genre} • {artist.category}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="review-modal-body">
          <h4 className="review-form-title">Leave a Review</h4>
          <p className="review-form-subtitle">Share your experience with this artist</p>

          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-group">
              <label htmlFor="customerName" className="form-label">
                Your Name *
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Rating *
              </label>
              <StarRating 
                rating={formData.rating} 
                onRatingChange={handleRatingChange}
                interactive={!isSubmitting}
              />
              <span className="rating-text">
                {formData.rating > 0 ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}` : 'Select a rating'}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="reviewText" className="form-label">
                Your Review *
              </label>
              <textarea
                id="reviewText"
                name="reviewText"
                value={formData.reviewText}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Share your experience and thoughts about this artist..."
                rows={4}
                required
                disabled={isSubmitting}
              />
            </div>

            {message && (
              <div className={`form-message ${messageType}`}>
                {message}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ArtistReviewModal;
