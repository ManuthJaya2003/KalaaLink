import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MainNav from '../../MainNav/MainNav';
import PasswordInput from '../../Common/PasswordInput';
import '../../Login/Login.css';

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
          <div className="login-header">
            <h1 className="login-title">Artist Login</h1>
            <p className="login-subtitle">Sign in to your artist account</p>
          </div>

          {error && (
            <div style={{ 
              color: "#dc3545", 
              textAlign: "center", 
              marginBottom: "20px",
              padding: "10px",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "8px",
              fontSize: "0.9rem"
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
                fontSize: '0.9rem',
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

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <span style={{ color: '#666' }}>Don't have an artist account? </span>
            <a href="/artist_registration" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
              Register here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtistLogin;
