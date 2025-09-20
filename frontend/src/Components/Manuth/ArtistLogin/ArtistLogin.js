import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MainNav from '../../MainNav/MainNav';
import PasswordInput from '../../Common/PasswordInput';
import AuthFooter from '../../Common/AuthFooter';
import '../../Login/Login.css';
import './ArtistLogin.css';

function ArtistLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/registeredArtists/login", {
        email,
        password,
      });

      // Login successful
      const artist = res.data.artist;
      console.log("Login successful:", artist);

      // Save artist info in localStorage for session
      localStorage.setItem("artist", JSON.stringify(artist));

      // Redirect to artist dashboard
      navigate("/artistdashboard");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Try again.");
      }
    }
  };

  return (
    <div>
      <MainNav />
      <div className="login-container">
        <div className="login-card">
          <div className="login-form-section">
            <div className="login-header">
              <h1 className="login-title">Artist Login</h1>
              <p className="login-subtitle">Sign in to your artist account</p>
            </div>

            {error && (
              <div style={{ 
                color: "#dc3545", 
                textAlign: "center", 
                marginBottom: "15px",
                padding: "8px",
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                borderRadius: "6px",
                fontSize: "0.8rem"
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                label="Password"
                required
              />

              <button type="submit" className="submit-btn">
                Sign In
              </button>
            </form>

            <div className="forgot-password">
              <button 
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: '0',
                  fontFamily: 'inherit'
                }}
                onClick={() => setError("Contact support to reset your password.")}
              >
                Forgot your password?
              </button>
            </div>

            <div className="login-divider">
              <span>or</span>
            </div>

            <div className="login-options">
              <a href="/login" className="login-option">
                Back to Main Login
              </a>
            </div>

            <div className="signup-section">
              <span>Don't have an artist account? </span>
              <a href="/artist_registration">Register here</a>
            </div>
          </div>

          <div className="login-image-section">
            <div className="login-image-container">
              <img 
                src="/artistLogin.jpg" 
                alt="Artist Login" 
                className="login-image"
              />
            </div>
          </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}

export default ArtistLogin;
