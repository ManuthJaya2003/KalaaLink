import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ImpactStories.css';

function ImpactStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedStory, setExpandedStory] = useState(null);

  useEffect(() => {
    fetchImpactStories();
  }, []);

  const fetchImpactStories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/impactStories');
      
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

  const toggleExpanded = (storyId) => {
    setExpandedStory(expandedStory === storyId ? null : storyId);
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="impact-stories-container">
        <div className="impact-stories-header">
          <h2>Our Impact Stories</h2>
          <p>See how your donations are making a difference</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading impact stories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="impact-stories-container">
        <div className="impact-stories-header">
          <h2>Our Impact Stories</h2>
          <p>See how your donations are making a difference</p>
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchImpactStories} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="impact-stories-container">
        <div className="impact-stories-header">
          <h2>Our Impact Stories</h2>
          <p>See how your donations are making a difference</p>
        </div>
        <div className="no-stories-container">
          <div className="no-stories-icon">📖</div>
          <h3>No Impact Stories Yet</h3>
          <p>Impact stories will appear here once they are added by our team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="impact-stories-container">
      <div className="impact-stories-header">
        <h2>Our Impact Stories</h2>
        <p>See how your donations are making a difference in the community</p>
      </div>
      
      <div className="impact-stories-grid">
        {stories.map((story) => (
          <div key={story._id} className="impact-story-card">
            <div className="story-image-container">
              <img
                src={`http://localhost:5000/uploads/${story.coverImage}`}
                alt={story.title}
                className="story-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjREREREREIi8+CjxwYXRoIGQ9Ik0xMzUgODVIMTY1VjExNUgxMzVWODVaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                }}
              />
            </div>
            
            <div className="story-content">
              <h3 className="story-title">{story.title}</h3>
              
              <div className="story-description">
                {expandedStory === story._id ? (
                  <p className="story-text">{story.description}</p>
                ) : (
                  <p className="story-text">{truncateText(story.description)}</p>
                )}
                
                {story.description.length > 150 && (
                  <button
                    className="read-more-button"
                    onClick={() => toggleExpanded(story._id)}
                  >
                    {expandedStory === story._id ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </div>
              
              <div className="story-meta">
                <span className="story-date">
                  {new Date(story.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImpactStories;
