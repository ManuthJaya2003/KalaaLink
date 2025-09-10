import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '../../MainNav/MainNav';
import PasswordInput from '../../Common/PasswordInput';
import employeeHeartbeat from '../../../utils/employeeHeartbeat';
import '../../Login/Login.css';

function ProfessionalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch("http://localhost:5000/api/employees/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          role: role.trim()
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // redirect based on role
      switch (data.employee.role.toLowerCase()) {
        case "admin":
          navigate("/admindashboard");
          break;
        case "artist manager":
          navigate("/overview");
          break;
        case "event manager":
          navigate("/EventManagerDash");
          break;
        case "marketplace manager":
          navigate("/marketplace-manager-dashboard");
          break;
        case "donation manager":
          navigate("/donation-manager-dashboard");
          break;
        default:
          setError("Invalid role");
      }

      // Save employee info in localStorage and start heartbeat
      localStorage.setItem("employee", JSON.stringify(data.employee));
      
      // Start heartbeat mechanism to maintain online status
      employeeHeartbeat.start(data.employee.id);

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div>
      <MainNav />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Professional Login</h1>
            <p className="login-subtitle">Sign in to your professional account</p>
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

          <form onSubmit={handleSubmit}>
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

            <div className="form-group">
              <label htmlFor="role" className="form-label">Role</label>
              <select
                id="role"
                name="role"
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                style={{ cursor: 'pointer' }}
              >
                <option value="">Select your role</option>
                <option value="admin">Admin</option>
                <option value="artist manager">Artist Manager</option>
                <option value="event manager">Event Manager</option>
                <option value="marketplace manager">Marketplace Manager</option>
                <option value="donation manager">Donation Manager</option>
              </select>
            </div>

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
              onClick={() => setError("Contact your administrator to reset your password.")}
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
        </div>
      </div>
    </div>
  );
}

export default ProfessionalLogin;
