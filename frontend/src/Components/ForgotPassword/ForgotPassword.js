import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainNav from '../MainNav/MainNav';
import { useAuth } from '../../contexts/AuthContext';
import './ForgotPassword.css';

function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await forgotPassword(formData.email, formData.newPassword);
    
    if (result.success) {
      setSuccess(result.message);
      // Reset form
      setFormData({ email: '', newPassword: '' });
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div>
      <MainNav />
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <h1 className="forgot-password-title">Reset Password</h1>
            <p className="forgot-password-subtitle">Enter your email and new password</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
            
            {success && (
              <div className="success-message" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>
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
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
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
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          <div className="back-to-login">
            <span>Remember your password? </span>
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
