import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainNav from '../MainNav/MainNav';
import PasswordInput from '../Common/PasswordInput';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', formData);
  };

  return (
    <div>
      <MainNav />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              label="Password"
              required
            />

            <button type="submit" className="submit-btn">
              Sign In
            </button>
          </form>

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="login-options">
            <Link to="/professional_login" className="login-option">
              Professional Login
            </Link>
            <Link to="/artist_login" className="login-option">
              Artist Login
            </Link>
          </div>

          <div className="signup-section">
            <span>Don't have an account? </span>
            <Link to="/signup">Sign up here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

