import React from "react";

function AdminHomeTab() {
  return (
    <div className="home-tab">
      <div className="welcome-section">
        <h1>Welcome to the Admin Dashboard</h1>
        <p className="welcome-subtitle">
          Manage your system, oversee employees, and monitor overall performance all in one place.
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
              <li>View system analytics</li>
              <li>Manage employees</li>
              <li>Review crew requests</li>
              <li>Handle user management</li>
              <li>Process complaints</li>
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
                <strong>Analytics:</strong> View system performance and metrics
              </div>
              <div className="feature-item">
                <strong>Employee Management:</strong> Manage staff and permissions
              </div>
              <div className="feature-item">
                <strong>Crew Requests:</strong> Review and approve crew applications
              </div>
              <div className="feature-item">
                <strong>User Management:</strong> Oversee customer accounts
              </div>
              <div className="feature-item">
                <strong>Complaints:</strong> Handle customer feedback and issues
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHomeTab;
