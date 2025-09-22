import React, { useState } from 'react';
import axios from 'axios';
import './PartnershipForm.css';

function PartnershipForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactName: '',
    contactEmail: '',
    message: '',
    logo: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Real-time validation handlers for name fields
  const handleNameChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({...validationErrors, [name]: ''});
    }
    
    // Real-time validation (only show errors after user has started typing)
    if (value.length > 0) {
      const validationError = validateName(value);
      if (validationError) {
        setValidationErrors({...validationErrors, [name]: validationError});
      }
    }
  };

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name.trim()) {
      return "Name is required";
    }
    if (!nameRegex.test(name)) {
      return "Name should only contain letters and spaces";
    }
    return "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        e.target.value = '';
        return;
      }
      
      // Compress and convert file to base64 for upload
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas to compress image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 300x300)
          const maxSize = 300;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
          
          setFormData(prev => ({
            ...prev,
            logo: compressedDataUrl
          }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      // Clear logo if no file selected
      setFormData(prev => ({
        ...prev,
        logo: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});

    // Validate name fields
    const organizationNameError = validateName(formData.organizationName);
    const contactNameError = validateName(formData.contactName);
    
    const errors = {};
    if (organizationNameError) errors.organizationName = organizationNameError;
    if (contactNameError) errors.contactName = contactNameError;
    
    // If there are validation errors, set them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fix the validation errors before proceeding');
      setLoading(false);
      return;
    }

    // Validate form data
    if (!formData.organizationName.trim() || !formData.contactName.trim() || 
        !formData.contactEmail.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Prepare data for submission
    const submitData = {
      organizationName: formData.organizationName.trim(),
      contactName: formData.contactName.trim(),
      contactEmail: formData.contactEmail.trim(),
      message: formData.message.trim(),
      logo: formData.logo || null
    };

    try {
      const response = await axios.post('http://localhost:5000/api/partnerships', submitData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.message) {
        alert('Partnership request submitted successfully! We will review your request and get back to you soon.');
        onSuccess && onSuccess();
        onClose && onClose();
      }
    } catch (error) {
      console.error('Error submitting partnership request:', error);
      setError(error.response?.data?.message || 'Failed to submit partnership request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="partnership-form-overlay">
      <div className="partnership-form-container">
        <div className="partnership-form-header">
          <h2>Request a Partnership</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="partnership-form">
          <div className="form-group">
            <label htmlFor="organizationName">Organization Name *</label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleNameChange}
              required
              placeholder="Enter your organization name"
              className={validationErrors.organizationName ? 'error' : ''}
            />
            {validationErrors.organizationName && (
              <span className="error-message">{validationErrors.organizationName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="contactName">Contact Name *</label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              value={formData.contactName}
              onChange={handleNameChange}
              required
              placeholder="Enter your full name"
              className={validationErrors.contactName ? 'error' : ''}
            />
            {validationErrors.contactName && (
              <span className="error-message">{validationErrors.contactName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="contactEmail">Contact Email *</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Tell us about your organization and how you'd like to partner with us..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="logo">Organization Logo (Optional)</label>
            <input
              type="file"
              id="logo"
              name="logo"
              accept="image/*"
              onChange={handleFileChange}
            />
            <small>Upload your organization's logo (JPG, PNG, or GIF)</small>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PartnershipForm;
