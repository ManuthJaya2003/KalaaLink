import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainNav from '../MainNav/MainNav';
import PasswordInput from '../Common/PasswordInput';
import AuthFooter from '../Common/AuthFooter';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameErrors, setNameErrors] = useState({ firstName: '', lastName: '' });
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Name validation function
  const validateName = (name, fieldName) => {
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      return `${fieldName} must be at least 2 characters long`;
    }
    
    if (!/^[A-Za-z]+$/.test(trimmedName)) {
      return `${fieldName} can only contain letters (A-Z, a-z)`;
    }
    
    if (name !== trimmedName) {
      return `${fieldName} cannot have leading or trailing spaces`;
    }
    
    return '';
  };

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[*$#@!%^&()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character (*, $, #, @, etc.)');
    }
    
    return errors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
    
    // Validate names in real-time
    if (e.target.name === 'firstName' || e.target.name === 'lastName') {
      const fieldName = e.target.name === 'firstName' ? 'First Name' : 'Last Name';
      const nameError = validateName(e.target.value, fieldName);
      setNameErrors(prev => ({
        ...prev,
        [e.target.name]: nameError
      }));
    }
    
    // Validate password in real-time
    if (e.target.name === 'password') {
      const passwordErrors = validatePassword(e.target.value);
      if (passwordErrors.length > 0) {
        setPasswordError(passwordErrors[0]); // Show first error
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setPasswordError('');
    setNameErrors({ firstName: '', lastName: '' });

    // Validate names before submission
    const firstNameError = validateName(formData.firstName, 'First Name');
    const lastNameError = validateName(formData.lastName, 'Last Name');
    
    if (firstNameError || lastNameError) {
      setNameErrors({
        firstName: firstNameError,
        lastName: lastNameError
      });
      setLoading(false);
      return;
    }

    // Validate password before submission
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setPasswordError(passwordErrors[0]);
      setLoading(false);
      return;
    }

    try {
      const result = await signup(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );
      
      if (result.success) {
        setSuccess('Account created successfully!');
        // Reset form
        setFormData({ firstName: '', lastName: '', email: '', password: '' });
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/mainhome');
        }, 2000);
      } else {
        setError(result.message || 'Signup failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <MainNav />
      <div className="login-container">
        <div className="login-card">
          <div className="login-form-section">
          <div className="login-header">
            <h1 className="login-title">Create Account</h1>
            <p className="login-subtitle">Join us and start your journey</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message" style={{ 
                color: 'red', 
                marginBottom: '1rem', 
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div className="success-message" style={{ 
                color: 'green', 
                marginBottom: '1rem', 
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                {success}
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
              {nameErrors.firstName && (
                <div className="name-error-message" style={{ 
                  color: 'red', 
                  marginTop: '0.5rem', 
                  fontSize: '0.85rem',
                  textAlign: 'left'
                }}>
                  {nameErrors.firstName}
                </div>
              )}
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
              {nameErrors.lastName && (
                <div className="name-error-message" style={{ 
                  color: 'red', 
                  marginTop: '0.5rem', 
                  fontSize: '0.85rem',
                  textAlign: 'left'
                }}>
                  {nameErrors.lastName}
                </div>
              )}
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

            {passwordError && (
              <div className="password-error-message" style={{ 
                color: 'red', 
                marginTop: '0.5rem', 
                marginBottom: '1rem', 
                fontSize: '0.85rem',
                textAlign: 'left'
              }}>
                {passwordError}
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
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

          <div className="login-image-section">
            <div className="login-image-container">
              <img 
                src="/signUppic.jpg" 
                alt="Sign Up" 
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

export default SignUp;
