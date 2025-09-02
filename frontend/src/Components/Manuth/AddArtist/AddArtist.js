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
    image: null,
  });

  const [preview, setPreview] = useState("");
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

  return (
    <div className="dashboard-page">
      <MainNav />

      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-container">
          <div className="dashboard-header-left">
            <h1 className="dashboard-header-title">Artist Manager Dashboard</h1>
            <p className="dashboard-welcome-message">
              Welcome back, {userName}! Manage your artists and applications efficiently.
            </p>
          </div>
          <button className="dashboard-signout-btn" onClick={handleSignOut}>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <ArtistManagerNav />

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
                  <span className="currency-symbol">$</span>
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
              <label htmlFor="image" className="form-label">Artist Image</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-input"
                />
                <label htmlFor="image" className="image-upload-label">
                  <span className="upload-icon">📷</span>
                  <span>Choose Image</span>
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
  );
}

export default Artist;
