import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ImpactStoriesManagement.css';

function ImpactStoriesManagement() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: null,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchImpactStories();
  }, []);

  const fetchImpactStories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/impactStories/admin/all');
      
      if (response.data.success) {
        setStories(response.data.stories);
      } else {
        setError('Failed to load impact stories');
      }
    } catch (err) {
      console.error('Error fetching impact stories:', err);
      setError('Failed to load impact stories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      coverImage: e.target.files[0]
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      coverImage: null,
      isActive: true
    });
    setEditingStory(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and description are required');
      return;
    }

    if (!editingStory && !formData.coverImage) {
      alert('Cover image is required for new stories');
      return;
    }

    setSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('isActive', formData.isActive);
      
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }

      let response;
      if (editingStory) {
        response = await axios.put(
          `http://localhost:5000/api/impactStories/admin/update/${editingStory._id}`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        response = await axios.post(
          'http://localhost:5000/api/impactStories/admin/create',
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      if (response.data.success) {
        alert(editingStory ? 'Impact story updated successfully!' : 'Impact story created successfully!');
        resetForm();
        fetchImpactStories();
      } else {
        alert('Failed to save impact story');
      }
    } catch (err) {
      console.error('Error saving impact story:', err);
      alert('Failed to save impact story. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      description: story.description,
      coverImage: null,
      isActive: story.isActive
    });
    setShowAddForm(true);
  };

  const handleDelete = async (storyId, storyTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${storyTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/impactStories/admin/delete/${storyId}`);
      
      if (response.data.success) {
        alert('Impact story deleted successfully!');
        fetchImpactStories();
      } else {
        alert('Failed to delete impact story');
      }
    } catch (err) {
      console.error('Error deleting impact story:', err);
      alert('Failed to delete impact story. Please try again.');
    }
  };

  const handleToggleStatus = async (storyId, currentStatus) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/impactStories/admin/toggle/${storyId}`);
      
      if (response.data.success) {
        alert(`Impact story ${response.data.story.isActive ? 'activated' : 'deactivated'} successfully!`);
        fetchImpactStories();
      } else {
        alert('Failed to update impact story status');
      }
    } catch (err) {
      console.error('Error toggling impact story status:', err);
      alert('Failed to update impact story status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="impact-stories-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading impact stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="impact-stories-management">
      <div className="management-header">
        <div>
          <h2>Impact Stories Management</h2>
          <p>Manage impact stories that appear on the donations page</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="add-story-button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Story
        </button>
      </div>

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchImpactStories} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h3>{editingStory ? 'Edit Impact Story' : 'Add New Impact Story'}</h3>
              <button onClick={resetForm} className="close-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="story-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter story title"
                  maxLength="200"
                  required
                />
                <small>{formData.title.length}/200 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter story description"
                  rows="6"
                  maxLength="2000"
                  required
                />
                <small>{formData.description.length}/2000 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="coverImage">
                  Cover Image {!editingStory && '*'}
                </label>
                <input
                  type="file"
                  id="coverImage"
                  name="coverImage"
                  onChange={handleFileChange}
                  accept="image/*"
                  required={!editingStory}
                />
                <small>Upload a cover image (JPG, PNG, GIF - Max 5MB)</small>
                {editingStory && (
                  <div className="current-image">
                    <p>Current image:</p>
                    <img
                      src={`http://localhost:5000/uploads/${editingStory.coverImage}`}
                      alt="Current cover"
                      className="current-image-preview"
                    />
                  </div>
                )}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Active (visible on donations page)
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={resetForm}
                  className="cancel-button"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingStory ? 'Update Story' : 'Create Story')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stories List */}
      <div className="stories-list">
        {stories.length === 0 ? (
          <div className="no-stories-container">
            <div className="no-stories-icon">📖</div>
            <h3>No Impact Stories</h3>
            <p>Create your first impact story to showcase the impact of donations.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="add-first-story-button"
            >
              Add First Story
            </button>
          </div>
        ) : (
          <div className="stories-grid">
            {stories.map((story) => (
              <div key={story._id} className="story-card">
                <div className="story-image-container">
                  <img
                    src={`http://localhost:5000/uploads/${story.coverImage}`}
                    alt={story.title}
                    className="story-image"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjREREREREIi8+CjxwYXRoIGQ9Ik0xMzUgODVIMTY1VjExNUgxMzVWODVaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                    }}
                  />
                  <div className={`status-badge ${story.isActive ? 'active' : 'inactive'}`}>
                    {story.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <div className="story-content">
                  <h3 className="story-title">{story.title}</h3>
                  <p className="story-description">
                    {story.description.length > 100 
                      ? `${story.description.substring(0, 100)}...` 
                      : story.description
                    }
                  </p>
                  
                  <div className="story-meta">
                    <span className="story-date">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="story-actions">
                    <button
                      onClick={() => handleEdit(story)}
                      className="edit-button"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleToggleStatus(story._id, story.isActive)}
                      className={`toggle-button ${story.isActive ? 'deactivate' : 'activate'}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {story.isActive ? (
                          <path d="M18 6L6 18M6 6l12 12"></path>
                        ) : (
                          <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
                        )}
                      </svg>
                      {story.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(story._id, story.title)}
                      className="delete-button"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImpactStoriesManagement;
