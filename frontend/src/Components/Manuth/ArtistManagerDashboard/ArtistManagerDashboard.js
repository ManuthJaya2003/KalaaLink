import React from "react";
import MainNav from "../../MainNav/MainNav";
import ArtistManagerNav from "../ArtistManagerNav/ArtistManagerNav";
import "./ArtistManagerDashboard.css";

function ArtistManagerDashboard() {
  const handleSignOut = () => {
    // Sign out functionality will be implemented here
    console.log("Sign out clicked");
  };

  // Mock user name - this would come from authentication context
  const userName = "Manuth";

  return (
    <div className="dashboard-page">
      <MainNav />
      
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-container">
          <div className="dashboard-header-left">
            <h1 className="dashboard-header-title">Artist Manager Dashboard</h1>
            <p className="dashboard-welcome-message">
              Welcome back, {userName}! Manage your artists and applications efficiently.
            </p>
          </div>
          <button className="dashboard-signout-btn" onClick={handleSignOut}>
            <svg className="signout-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </header>
      
      <ArtistManagerNav />
      
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Main dashboard content will go here */}
        </div>
      </main>
    </div>
  );
}

export default ArtistManagerDashboard;
