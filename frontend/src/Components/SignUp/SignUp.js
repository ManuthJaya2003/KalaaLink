import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainNav from '../MainNav/MainNav';
import PasswordInput from '../Common/PasswordInput';
import { useAuth } from '../../contexts/AuthContext';
import '../Login/Login.css';
import './SignUp.css';

function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signup(
      formData.firstName, 
      formData.lastName, 
      formData.email, 
      formData.password
    );
    
    if (result.success) {
      // Redirect to login page after successful signup
      navigate('/login');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div>
      <MainNav />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Create Account</h1>
            <p className="login-subtitle">Join us and start your journey</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-input"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
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
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
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
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              label="Password"
              required
              disabled={loading}
            />

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="login-options">
            <Link to="/register" className="login-option">
              Artist Registration
            </Link>
          </div>

          <div className="signup-section">
            <span>Already have an account? </span>
            <Link to="/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
