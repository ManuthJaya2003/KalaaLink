import React, { useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import MainNav from '../../MainNav/MainNav';
import PasswordInput from '../../Common/PasswordInput';
import AuthFooter from '../../Common/AuthFooter';
import '../../Login/Login.css';
import './ArtistRegistration.css';

function ArtistRegistration() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    stageName: "",
    bio: "",
    password: "",
    genre: "",
    category: "",
    summary: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Debug: Log the form data being sent
    console.log("Form data being sent:", form);
    console.log("All required fields present:", {
      firstName: !!form.firstName,
      lastName: !!form.lastName,
      email: !!form.email,
      stageName: !!form.stageName,
      bio: !!form.bio,
      password: !!form.password,
      genre: !!form.genre,
      category: !!form.category,
      summary: !!form.summary
    });

    try {
      const res = await axios.post("http://localhost:5000/registeredArtists/register", form, {
        headers: { "Content-Type": "application/json" }
      });
      console.log("Registration successful:", res.data);
      setMessage({ type: 'success', text: res.data.message });
      setForm({ firstName: "", lastName: "", email: "", stageName: "", bio: "", password: "", genre: "", category: "", summary: "" });
    } catch (error) {
      console.error("Error registering artist:", error.response?.data || error.message);
      console.error("Full error object:", error);
      const errorMessage = error.response?.data?.message || "Error registering artist. Try again.";
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <MainNav />
      <div className="login-container">
        <div className="login-card">
          <div className="login-form-section">
            <div className="login-header">
              <h1 className="login-title">Artist Registration</h1>
              <p className="login-subtitle">Join our community of talented artists</p>
            </div>

            {message.text && (
              <div className={message.type === 'success' ? 'success-message' : 'error-message'} style={{ 
                color: message.type === 'success' ? "#28a745" : "#dc3545",
                textAlign: "center", 
                marginBottom: "15px",
                padding: "8px",
                backgroundColor: message.type === 'success' ? "#d4edda" : "#f8d7da",
                border: `1px solid ${message.type === 'success' ? "#c3e6cb" : "#f5c6cb"}`,
                borderRadius: "6px",
                fontSize: "0.8rem"
              }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="form-input"
                  placeholder="Enter your first name"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="form-input"
                  placeholder="Enter your last name"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stageName" className="form-label">Stage Name</label>
                <input
                  type="text"
                  id="stageName"
                  name="stageName"
                  className="form-input"
                  placeholder="Enter your stage name"
                  value={form.stageName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio" className="form-label">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  className="form-input"
                  placeholder="Tell us about yourself and your art"
                  value={form.bio}
                  onChange={handleChange}
                  required
                  rows="3"
                  style={{ 
                    resize: 'vertical',
                    minHeight: '80px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="genre" className="form-label">Genre</label>
                <input
                  type="text"
                  id="genre"
                  name="genre"
                  className="form-input"
                  placeholder="e.g., Pop, Rock, Classical, Jazz, etc."
                  value={form.genre}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  className="form-input"
                  placeholder="e.g., Singer, Musician, Band, DJ, etc."
                  value={form.category}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="summary" className="form-label">Summary</label>
                <textarea
                  id="summary"
                  name="summary"
                  className="form-input"
                  placeholder="Brief summary of your artistic style and what makes you unique"
                  value={form.summary}
                  onChange={handleChange}
                  rows="2"
                  style={{ 
                    resize: 'vertical',
                    minHeight: '60px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <PasswordInput
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a secure password"
                label="Password"
                required
              />

              <button 
                type="submit" 
                className={`submit-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Artist Account'}
              </button>
            </form>

            <div className="login-divider">
              <span>or</span>
            </div>

            <div className="login-options">
              <Link to="/signup" className="login-option">
                Regular User Registration
              </Link>
              <Link to="/login" className="login-option">
                Back to Login
              </Link>
            </div>

            <div className="signup-section">
              <span>Already have an account? </span>
              <Link to="/artist_login">Sign in here</Link>
            </div>
          </div>

          <div className="login-image-section">
            <div className="login-image-placeholder">
              <div className="placeholder-content">
                <div className="placeholder-icon">🎭</div>
                <h3>Join the Creative Community</h3>
                <p>Connect with fellow artists, showcase your talent, and discover amazing opportunities in the world of arts and entertainment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}

export default ArtistRegistration;
