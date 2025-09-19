import React, { useState } from 'react';
import axios from 'axios';
import StarRating from '../Common/StarRating';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, artist, onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    rating: 0,
    review: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    
    if (!formData.customerName.trim() || !formData.rating || !formData.review.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      setError('Please select a valid rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/artist-reviews', {
        artistId: artist._id,
        customerName: formData.customerName.trim(),
        rating: formData.rating,
        review: formData.review.trim()
      });

      if (response.data.success) {
        // Reset form
        setFormData({
          customerName: '',
          rating: 0,
          review: ''
        });
        
        // Notify parent component
        onReviewSubmitted(response.data.review);
        
        // Close modal
        onClose();
      } else {
        setError(response.data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        customerName: '',
        rating: 0,
        review: ''
      });
      setError('');
      onClose();
    }
  };

  if (!isOpen || !artist) return null;

  return (
    <div className="review-modal-overlay" onClick={handleClose}>
      <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h2>Post a Review</h2>
          <button className="review-modal-close" onClick={handleClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <div className="review-modal-body">
          <div className="artist-info">
            {artist.image ? (
              <img
                src={artist.image.startsWith("/uploads/") 
                  ? `http://localhost:5000${artist.image}` 
                  : `http://localhost:5000/uploads/${artist.image}`}
                alt={artist.artistName}
                className="artist-profile-image"
              />
            ) : (
              <div className="artist-profile-placeholder">
                {artist.artistName?.charAt(0) || 'A'}
              </div>
            )}
            <div className="artist-details">
              <h3>{artist.artistName}</h3>
              <p>{artist.genre} • {artist.category}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-group">
              <label htmlFor="customerName">Your Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Rating *</label>
              <StarRating
                rating={formData.rating}
                onRatingChange={handleRatingChange}
                interactive={true}
                size="large"
              />
            </div>

            <div className="form-group">
              <label htmlFor="review">Your Review *</label>
              <textarea
                id="review"
                name="review"
                value={formData.review}
                onChange={handleInputChange}
                placeholder="Share your experience with this artist..."
                rows="2"
                required
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !formData.customerName.trim() || !formData.rating || !formData.review.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
