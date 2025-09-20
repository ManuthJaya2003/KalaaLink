import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainNav from '../MainNav/MainNav';
import PasswordInput from '../Common/PasswordInput';
import AuthFooter from '../Common/AuthFooter';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Redirect to home page on successful login
        navigate('/mainhome');
      } else {
        setError(result.message || 'Login failed');
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
              <h1 className="login-title">Welcome Back</h1>
              <p className="login-subtitle">Sign in to your account to continue</p>
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

              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                label="Password"
                required
                disabled={loading}
              />

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
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
          
          <div className="login-image-section">
            <div className="login-image-container">
              <img 
                src="/customerLogin.jpg" 
                alt="Customer Login" 
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

export default Login;

