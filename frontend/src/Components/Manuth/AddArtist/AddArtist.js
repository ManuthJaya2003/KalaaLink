import React, { useState } from 'react';
import MainNav from '../../MainNav/MainNav';
import ArtistManagerNav from '../ArtistManagerNav/ArtistManagerNav';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../Login/Login.css';
import './AddArtist.css';

function Artist() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    artistName: "",
    genre: "",
    otherGenre: "", // for specifying if Other is chosen
    category: "",
    bookingPrice: "",
    summary: "",
    bio: "",
    image: null, // cover image
    profilePic: null, // profile picture
  });

  const [preview, setPreview] = useState("");
  const [profilePreview, setProfilePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputs(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputs(prev => ({ ...prev, profilePic: file }));
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const sendRequest = async () => {
    const formData = new FormData();
    formData.append("artistName", inputs.artistName);
    // Send genre or otherGenre depending on choice
    formData.append("genre", inputs.genre === "Other" ? inputs.otherGenre : inputs.genre);
    formData.append("category", inputs.category);
    formData.append("bookingPrice", inputs.bookingPrice);
    formData.append("summary", inputs.summary);
    formData.append("bio", inputs.bio);
    if (inputs.image) {
      formData.append("image", inputs.image);
    }
    if (inputs.profilePic) {
      formData.append("profilePic", inputs.profilePic);
    }

    try {
      const res = await axios.post("http://localhost:5000/artists", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (error) {
      console.error("Failed to send request", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await sendRequest();
      setMessage({ type: 'success', text: 'Artist added successfully!' });
      setTimeout(() => {
        navigate('/artists');
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add artist. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    navigate("/mainhome");
  };

  const userName = "Manuth";

  const getButtonStyle = (isActive) => ({
    background: isActive ? "#34495e" : "transparent",
    border: "none",
    color: "white",
    textAlign: "left",
    padding: "10px 0",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: isActive ? "bold" : "normal",
    width: "100%",
    marginBottom: "5px",
    borderRadius: "5px",
    transition: "background-color 0.3s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Navigation Bar */}
      <div
        style={{
          background: "#34495e",
          color: "white",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #2c3e50",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          Artist Manager Dashboard
        </h1>
        <button
          onClick={handleSignOut}
          style={{
            background: "#e74c3c",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => e.target.style.background = "#c0392b"}
          onMouseLeave={(e) => e.target.style.background = "#e74c3c"}
        >
          Sign Out
        </button>
      </div>

      {/* Main Dashboard Container */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div
          style={{
            width: "220px",
            background: "#2c3e50",
            color: "white",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          <h2 style={{ marginBottom: "30px" }}>Dashboard</h2>
          <button 
            onClick={() => navigate('/overview')} 
            style={getButtonStyle(false)}
          >
            Analytics
          </button>
          <button 
            onClick={() => navigate('/applications')} 
            style={getButtonStyle(false)}
          >
            Applications
          </button>
          <button 
            onClick={() => navigate('/manage_artists')} 
            style={getButtonStyle(false)}
          >
            Manage Artists
          </button>
          <button 
            onClick={() => navigate('/addArtist')} 
            style={getButtonStyle(true)}
          >
            Add Artist
          </button>
          <button 
            onClick={() => navigate('/artist_reviews')} 
            style={getButtonStyle(false)}
          >
            Artist Reviews
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "20px" }}>

      <div className="add-artist-container">
        <div className="add-artist-card">
          <div className="add-artist-header">
            <h1 className="add-artist-title">Add New Artist</h1>
            <p className="add-artist-subtitle">Expand your artist portfolio with new talent</p>
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="add-artist-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="artistName" className="form-label">Artist Name *</label>
                <input
                  type="text"
                  id="artistName"
                  name="artistName"
                  className="form-input"
                  placeholder="Enter artist name"
                  value={inputs.artistName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="genre" className="form-label">Genre *</label>
                <select
                  id="genre"
                  name="genre"
                  className="form-input"
                  value={inputs.genre}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Genre</option>
                  <option value="Dancer">Dancer</option>
                  <option value="Singer">Singer</option>
                  <option value="Artist">Artist</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {inputs.genre === "Other" && (
              <div className="form-group">
                <label htmlFor="otherGenre" className="form-label">Specify Genre *</label>
                <input
                  type="text"
                  id="otherGenre"
                  name="otherGenre"
                  className="form-input"
                  placeholder="Please specify the genre"
                  value={inputs.otherGenre}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category" className="form-label">Category *</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  className="form-input"
                  placeholder="e.g., Contemporary, Classical, Pop"
                  value={inputs.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bookingPrice" className="form-label">Booking Price *</label>
                <div className="price-input-container">
                  <span className="currency-symbol">LKR</span>
                  <input
                    type="number"
                    id="bookingPrice"
                    name="bookingPrice"
                    className="form-input price-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={inputs.bookingPrice}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="summary" className="form-label">Summary *</label>
              <textarea
                id="summary"
                name="summary"
                className="form-input"
                placeholder="Brief description of the artist's style and expertise"
                rows="3"
                value={inputs.summary}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="form-label">Bio *</label>
              <textarea
                id="bio"
                name="bio"
                className="form-input"
                placeholder="Detailed biography and background information"
                rows="5"
                value={inputs.bio}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image" className="form-label">Cover Image (Banner)</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-input"
                />
                <label htmlFor="image" className="image-upload-label">
                  <span className="upload-icon">🖼️</span>
                  <span>Choose Cover Image</span>
                </label>
              </div>
              
              {preview && (
                <div className="image-preview-container">
                  <img
                    src={preview}
                    alt="Preview"
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setPreview("");
                      setInputs(prev => ({ ...prev, image: null }));
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="profilePic" className="form-label">Profile Picture</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="profilePic"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="image-input"
                />
                <label htmlFor="profilePic" className="image-upload-label">
                  <span className="upload-icon">👤</span>
                  <span>Choose Profile Picture</span>
                </label>
              </div>
              
              {profilePreview && (
                <div className="image-preview-container">
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="image-preview profile-preview"
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setProfilePreview("");
                      setInputs(prev => ({ ...prev, profilePic: null }));
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/artists')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`submit-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Adding Artist...' : 'Add Artist'}
              </button>
            </div>
          </form>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

export default Artist;
