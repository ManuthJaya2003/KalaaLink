import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditArtistModal = ({ isOpen, onClose, artist, onSave }) => {
  const [formData, setFormData] = useState({
    artistName: '',
    genre: '',
    category: '',
    bookingPrice: '',
    summary: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (artist && isOpen) {
      setFormData({
        artistName: artist.artistName || '',
        genre: artist.genre || '',
        category: artist.category || '',
        bookingPrice: artist.bookingPrice || '',
        summary: artist.summary || '',
        bio: artist.bio || ''
      });
    }
  }, [artist, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for the update request
      const updateData = new FormData();
      updateData.append("artistName", formData.artistName);
      updateData.append("genre", formData.genre);
      updateData.append("category", formData.category);
      updateData.append("bookingPrice", formData.bookingPrice);
      updateData.append("summary", formData.summary);
      updateData.append("bio", formData.bio);

      const response = await axios.put(`http://localhost:5000/artists/${artist._id}`, updateData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (response.data.success) {
        onSave(response.data.artist);
        onClose();
        alert('Artist updated successfully!');
      } else {
        alert('Failed to update artist. Please try again.');
      }
    } catch (error) {
      console.error('Error updating artist:', error);
      alert('Failed to update artist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-artist-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Artist</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form edit-artist-form">
          {/* 3x1 Grid for basic fields */}
          <div className="form-grid-basic">
            <div className="form-group">
              <label htmlFor="artistName">Artist Name *</label>
              <input
                type="text"
                id="artistName"
                name="artistName"
                value={formData.artistName}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="genre">Genre *</label>
              <input
                type="text"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Narrow field for booking price */}
          <div className="form-group-narrow">
            <label htmlFor="bookingPrice">Booking Price (LKR) *</label>
            <input
              type="number"
              id="bookingPrice"
              name="bookingPrice"
              value={formData.bookingPrice}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="form-input"
            />
          </div>

          {/* Narrow fields for Summary and Bio */}
          <div className="form-group-narrow">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows="4"
              className="form-textarea"
            />
          </div>

          <div className="form-group-narrow">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="form-textarea"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArtistModal;
