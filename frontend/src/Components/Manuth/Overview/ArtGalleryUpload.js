import React, { useState } from 'react';
import axios from 'axios';
import './ArtGalleryUpload.css';

const ArtGalleryUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    artistName: '',
    description: '',
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.artistName || !formData.description || !formData.image) {
      showNotification('error', 'Please fill in all fields and select an image');
      return;
    }

    setIsUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('image', formData.image);
      uploadData.append('title', formData.title);
      uploadData.append('artist', formData.artistName);
      uploadData.append('summary', formData.description);

      // Debug logging
      console.log('Uploading artwork:', {
        title: formData.title,
        artist: formData.artistName,
        summary: formData.description,
        imageFile: formData.image,
        imageType: formData.image?.type,
        imageSize: formData.image?.size
      });

      const response = await axios.post('http://localhost:5000/api/artworks', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        showNotification('success', 'Artwork successfully uploaded to gallery!');
        
        // Reset form
        setFormData({
          title: '',
          artistName: '',
          description: '',
          image: null
        });
        setPreview(null);
        
        // Reset file input
        const fileInput = document.getElementById('image-upload');
        if (fileInput) {
          fileInput.value = '';
        }
      }
    } catch (error) {
      console.error('Error uploading artwork:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to upload artwork. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification('error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="art-gallery-upload">
      <div className="section-header">
        <h1>Art Gallery Management</h1>
        <p className="section-subtitle">
          Upload new artworks to be displayed in the Virtual Art Gallery
        </p>
      </div>

      <div className="upload-form-container">
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Artwork Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter the artwork title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="artistName">Artist Name *</label>
            <input
              type="text"
              id="artistName"
              name="artistName"
              value={formData.artistName}
              onChange={handleInputChange}
              placeholder="Enter the artist's name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter a short description of the artwork"
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image-upload">Artwork Image *</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="image-upload"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              <label htmlFor="image-upload" className="file-upload-label">
                <span className="upload-icon">📷</span>
                <span className="upload-text">
                  {formData.image ? 'Change Image' : 'Choose Image'}
                </span>
              </label>
            </div>
            
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" />
                <p className="preview-text">Preview</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload to Gallery'}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtGalleryUpload;
