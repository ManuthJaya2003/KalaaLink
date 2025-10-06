import React, { useState, useEffect } from "react";
import axios from "axios";

function GalleryTab() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    image: null,
    altText: "",
    associatedEventId: ""
  });
  const [uploading, setUploading] = useState(false);

  // Fetch gallery images
  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/gallery");
      setGalleryImages(response.data.data || []);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events for dropdown
  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/gallery/events");
      setEvents(response.data.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
    fetchEvents();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      alert("Please select an image file");
      return;
    }
    
    if (!formData.altText.trim()) {
      alert("Please enter alt text for the image");
      return;
    }

    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("image", formData.image);
      formDataToSend.append("altText", formData.altText);
      if (formData.associatedEventId) {
        formDataToSend.append("associatedEventId", formData.associatedEventId);
      }

      const response = await axios.post("http://localhost:5000/api/gallery", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        // Reset form
        setFormData({
          image: null,
          altText: "",
          associatedEventId: ""
        });
        setShowAddModal(false);
        // Refresh gallery images
        fetchGalleryImages();
        alert("Gallery image added successfully!");
      }
    } catch (error) {
      console.error("Error adding gallery image:", error);
      alert("Failed to add gallery image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete image
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/gallery/${imageId}`);
      if (response.data.success) {
        fetchGalleryImages();
        alert("Gallery image deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      alert("Failed to delete gallery image. Please try again.");
    }
  };

  return (
    <div className="gallery-tab">
      <div className="section-header">
        <h1>Gallery Management</h1>
        <p className="section-subtitle">Manage gallery images for the Events page</p>
      </div>

      {/* Add Image Button */}
      <div className="gallery-actions">
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add Image
        </button>
      </div>

      {/* Gallery Images Table */}
      <div className="gallery-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading gallery images...</p>
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="no-images">
            <p>No gallery images found. Add your first image to get started!</p>
          </div>
        ) : (
          <table className="gallery-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Alt Text</th>
                <th>Associated Event</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {galleryImages.map((image) => (
                <tr key={image._id}>
                  <td>
                    <div className="image-preview">
                      <img 
                        src={`http://localhost:5000${image.imageUrl}`} 
                        alt={image.altText}
                        className="preview-image"
                      />
                    </div>
                  </td>
                  <td>{image.altText}</td>
                  <td>
                    {image.associatedEventId ? image.associatedEventId.eventTitle : "None"}
                  </td>
                  <td>
                    {new Date(image.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleDeleteImage(image._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Image Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add Gallery Image</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="gallery-form">
                <div className="form-group">
                  <label htmlFor="image">Image File *</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="altText">Alt Text *</label>
                  <input
                    type="text"
                    id="altText"
                    name="altText"
                    value={formData.altText}
                    onChange={handleInputChange}
                    placeholder="Enter descriptive text for the image"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="associatedEventId">Associated Event (Optional)</label>
                  <select
                    id="associatedEventId"
                    name="associatedEventId"
                    value={formData.associatedEventId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select an event (optional)</option>
                    {events.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.eventTitle} - {new Date(event.eventDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Add Image"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryTab;
