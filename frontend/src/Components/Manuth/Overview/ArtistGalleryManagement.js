import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ArtistGalleryManagement.css";

function ArtistGalleryManagement() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    image: null,
    title: "",
    artist: "",
    summary: ""
  });
  const [uploading, setUploading] = useState(false);

  // Fetch artworks
  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/artworks");
      setArtworks(response.data || []);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchArtworks();
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
    
    if (!formData.title.trim()) {
      alert("Please enter a title for the artwork");
      return;
    }

    if (!formData.artist.trim()) {
      alert("Please enter the artist name");
      return;
    }

    if (!formData.summary.trim()) {
      alert("Please enter a summary for the artwork");
      return;
    }

    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("image", formData.image);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("artist", formData.artist);
      formDataToSend.append("summary", formData.summary);

      const response = await axios.post("http://localhost:5000/api/artworks", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.status === 201) {
        // Reset form
        setFormData({
          image: null,
          title: "",
          artist: "",
          summary: ""
        });
        setShowAddModal(false);
        // Refresh artworks
        fetchArtworks();
        alert("Artwork added successfully!");
      }
    } catch (error) {
      console.error("Error adding artwork:", error);
      alert("Failed to add artwork. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete artwork
  const handleDeleteArtwork = async (artworkId) => {
    if (!window.confirm("Are you sure you want to delete this artwork?")) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/artworks/${artworkId}`);
      if (response.status === 200) {
        fetchArtworks();
        alert("Artwork deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting artwork:", error);
      alert("Failed to delete artwork. Please try again.");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Truncate text
  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="gallery-tab">
      <div className="section-header">
        <h1>Art Management</h1>
        <p className="section-subtitle">Manage artworks for the Virtual Art Gallery</p>
      </div>

      {/* Add Artwork Button */}
      <div className="gallery-actions">
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add Art
        </button>
      </div>

      {/* Artworks Table */}
      <div className="gallery-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading artworks...</p>
          </div>
        ) : artworks.length === 0 ? (
          <div className="no-images">
            <p>No artworks found. Add your first artwork to get started!</p>
          </div>
        ) : (
          <table className="gallery-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Artist Name</th>
                <th>Summary</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {artworks.map((artwork) => (
                <tr key={artwork._id}>
                  <td>
                    <div className="image-preview">
                      <img 
                        src={artwork.image} 
                        alt={artwork.title}
                        className="preview-image"
                      />
                    </div>
                  </td>
                  <td>{artwork.title}</td>
                  <td>{artwork.artist}</td>
                  <td>{truncateText(artwork.summary)}</td>
                  <td>
                    {formatDate(artwork.createdAt)}
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleDeleteArtwork(artwork._id)}
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

      {/* Add Artwork Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add Artwork</h2>
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
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter artwork title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="artist">Artist Name *</label>
                  <input
                    type="text"
                    id="artist"
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    placeholder="Enter artist name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="summary">Summary *</label>
                  <textarea
                    id="summary"
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    placeholder="Enter artwork summary"
                    rows="3"
                    required
                  />
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
                    {uploading ? "Uploading..." : "Add Artwork"}
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

export default ArtistGalleryManagement;
