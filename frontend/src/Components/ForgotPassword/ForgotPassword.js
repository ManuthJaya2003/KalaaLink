import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainNav from '../MainNav/MainNav';
import AuthFooter from '../Common/AuthFooter';
import { useAuth } from '../../contexts/AuthContext';
import '../Login/Login.css';
import './ForgotPassword.css';

function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { forgotPassword } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await forgotPassword(formData.email, formData.newPassword);
      
      if (result.success) {
        setSuccess('Password updated successfully! You can now login with your new password.');
        // Reset form
        setFormData({ email: '', newPassword: '' });
      } else {
        setError(result.message || 'Password reset failed');
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
      <div className="login-container forgot-password-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Reset Password</h1>
            <p className="login-subtitle">Enter your email and new password to reset your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="form-input"
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={loading}
                minLength="6"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          <div className="signup-section">
            <span>Remember your password? </span>
            <Link to="/login">Sign in here</Link>
          </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}

export default ForgotPassword;
