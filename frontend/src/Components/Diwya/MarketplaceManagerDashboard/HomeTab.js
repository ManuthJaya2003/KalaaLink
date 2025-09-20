import React from "react";

function HomeTab() {
  return (
    <div className="home-tab">
      <div className="welcome-section">
        <h1>Welcome to the Marketplace Manager Dashboard</h1>
        <p className="welcome-subtitle">
          Manage your marketplace inventory, track orders, and analyze performance all in one place.
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
              <li>Add a new product</li>
              <li>View product inventory</li>
              <li>Check recent orders</li>
              <li>Manage deliveries</li>
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
                <strong>Analytics:</strong> Track sales performance and metrics
              </div>
              <div className="feature-item">
                <strong>Products:</strong> Manage your product inventory
              </div>
              <div className="feature-item">
                <strong>Orders:</strong> View and process customer orders
              </div>
              <div className="feature-item">
                <strong>Deliveries:</strong> Track delivery status and logistics
              </div>
              <div className="feature-item">
                <strong>Customizations:</strong> Handle custom product requests
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeTab;
