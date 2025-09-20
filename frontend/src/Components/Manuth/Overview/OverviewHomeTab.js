import React from "react";

function OverviewHomeTab() {
  return (
    <div className="home-tab">
      <div className="welcome-section">
        <h1>Welcome to the Artist Manager Dashboard</h1>
        <p className="welcome-subtitle">
          Manage your artists, track bookings, and analyze performance all in one place.
        </p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-content">
            <p>Get started with these common tasks:</p>
            <ul className="action-list">
              <li>View artist applications</li>
              <li>Manage artist profiles</li>
              <li>Check recent bookings</li>
              <li>Review artist performance</li>
            </ul>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Dashboard Overview</h3>
          </div>
          <div className="card-content">
            <p>Use the sidebar navigation to access different sections:</p>
            <div className="feature-list">
              <div className="feature-item">
                <strong>Analytics:</strong> Track artist performance and engagement metrics
              </div>
              <div className="feature-item">
                <strong>Applications:</strong> Review and manage new artist applications
              </div>
              <div className="feature-item">
                <strong>Manage Artists:</strong> Update and maintain artist profiles
              </div>
              <div className="feature-item">
                <strong>Artist Reviews:</strong> Monitor and respond to artist reviews
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewHomeTab;
