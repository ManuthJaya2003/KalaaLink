import React from "react";

function HomeTab() {
  return (
    <div className="home-tab">
      <div className="welcome-section">
        <h1>Welcome to the Event Manager Dashboard</h1>
        <p className="welcome-subtitle">
          Manage your events, track bookings, and analyze performance all in one place.
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
              <li>Create a new event</li>
              <li>View ongoing events</li>
              <li>Check recent bookings</li>
              <li>Review testimonials</li>
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
                <strong>Organize Event:</strong> Create and manage new events
              </div>
              <div className="feature-item">
                <strong>Ongoing Events:</strong> View and edit current events
              </div>
              <div className="feature-item">
                <strong>Analytics:</strong> Track performance metrics
              </div>
              <div className="feature-item">
                <strong>Bookings:</strong> Manage customer reservations
              </div>
              <div className="feature-item">
                <strong>Testimonials:</strong> View customer feedback
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeTab;
