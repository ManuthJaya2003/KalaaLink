import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoutEmployee from "../../../utils/employeeLogout";
import "./ArtistManagerDashboard.css";

function ArtistManagerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");

  const handleSignOut = () => {
    logoutEmployee(navigate, "/mainhome");
  };

  return (
    <div className="dashboard-page">
      {/* Fixed Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Dashboard</h2>
          <div className="sidebar-logo">
            <img src="/logo.png" alt="KalaaLink Logo" className="logo-icon" />
          </div>
        </div>
        <nav className="sidebar-nav">
          <button 
            onClick={() => setActiveTab("home")} 
            className={`sidebar-btn ${activeTab === "home" ? "active" : ""}`}
          >
            Home
          </button>
          <button 
            onClick={() => setActiveTab("analytics")} 
            className={`sidebar-btn ${activeTab === "analytics" ? "active" : ""}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab("applications")} 
            className={`sidebar-btn ${activeTab === "applications" ? "active" : ""}`}
          >
            Applications
          </button>
          <button 
            onClick={() => setActiveTab("manage")} 
            className={`sidebar-btn ${activeTab === "manage" ? "active" : ""}`}
          >
            Manage Artists
          </button>
          <button 
            onClick={() => setActiveTab("reviews")} 
            className={`sidebar-btn ${activeTab === "reviews" ? "active" : ""}`}
          >
            Artist Reviews
          </button>
          <button 
            onClick={handleSignOut} 
            className="sidebar-btn signout-btn"
          >
            Sign Out
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Content Area */}
        <div className="dashboard-content">
          {activeTab === "home" && (
            <div className="home-tab">
              <div className="welcome-section">
                <h1>Welcome to Artist Manager Dashboard</h1>
                <p className="welcome-subtitle">
                  Manage your artists, applications, and reviews efficiently from this central hub.
                </p>
              </div>
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>Quick Actions</h3>
                  </div>
                  <div className="card-content">
                    <ul className="action-list">
                      <li>View artist applications</li>
                      <li>Manage artist profiles</li>
                      <li>Review artist performance</li>
                      <li>Update artist information</li>
                    </ul>
                  </div>
                </div>
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>Dashboard Features</h3>
                  </div>
                  <div className="card-content">
                    <div className="feature-list">
                      <div className="feature-item">
                        <strong>Analytics:</strong> Track artist performance and engagement metrics
                      </div>
                      <div className="feature-item">
                        <strong>Applications:</strong> Review and manage new artist applications
                      </div>
                      <div className="feature-item">
                        <strong>Artist Management:</strong> Update and maintain artist profiles
                      </div>
                      <div className="feature-item">
                        <strong>Reviews:</strong> Monitor and respond to artist reviews
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "analytics" && (
            <div className="section-header">
              <h1>Analytics</h1>
              <p className="section-subtitle">Track artist performance and engagement metrics</p>
            </div>
          )}
          {activeTab === "applications" && (
            <div className="section-header">
              <h1>Applications</h1>
              <p className="section-subtitle">Review and manage new artist applications</p>
            </div>
          )}
          {activeTab === "manage" && (
            <div className="section-header">
              <h1>Manage Artists</h1>
              <p className="section-subtitle">Update and maintain artist profiles</p>
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="section-header">
              <h1>Artist Reviews</h1>
              <p className="section-subtitle">Monitor and respond to artist reviews</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArtistManagerDashboard;
