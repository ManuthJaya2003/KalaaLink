import React, { useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import MainNav from '../../MainNav/MainNav';
import PasswordInput from '../../Common/PasswordInput';
import '../../Login/Login.css';

function ArtistRegistration() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    stageName: "",
    bio: "",
    password: ""
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

    try {
      const res = await axios.post("http://localhost:5000/registeredArtists/register", form, {
        headers: { "Content-Type": "application/json" }
      });
      setMessage({ type: 'success', text: res.data.message });
      setForm({ firstName: "", lastName: "", email: "", stageName: "", bio: "", password: "" });
    } catch (error) {
      console.error("Error registering artist:", error.response?.data || error.message);
      setMessage({ type: 'error', text: "Error registering artist. Try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <MainNav />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Artist Registration</h1>
            <p className="login-subtitle">Join our community of talented artists</p>
          </div>

          {message.text && (
            <div className={message.type === 'success' ? 'success-message' : 'error-message'} style={{ 
              color: message.type === 'success' ? "#28a745" : "#dc3545",
              textAlign: "center", 
              marginBottom: "20px",
              padding: "10px",
              backgroundColor: message.type === 'success' ? "#d4edda" : "#f8d7da",
              border: `1px solid ${message.type === 'success' ? "#c3e6cb" : "#f5c6cb"}`,
              borderRadius: "8px",
              fontSize: "0.9rem"
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
                rows="4"
                style={{ 
                  resize: 'vertical',
                  minHeight: '100px',
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

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <span style={{ color: '#666' }}>Already have an account? </span>
            <Link to="/artist_login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtistRegistration;
