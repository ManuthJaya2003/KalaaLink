import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OverviewHomeTab from "./OverviewHomeTab";
import OverviewAnalyticsTab from "./OverviewAnalyticsTab";
import OverviewApplicationsTab from "./OverviewApplicationsTab";
import OverviewManageArtistsTab from "./OverviewManageArtistsTab";
import ArtistReviews from "../ArtistReviews/ArtistReviews";
import logoutEmployee from "../../../utils/employeeLogout";
import "./Overview.css";

const Overview = () => {
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();

  // Sign out function
  const handleSignOut = () => {
    logoutEmployee(navigate, "/mainhome");
  };

  return (
    <div className="dashboard-page">
      {/* Fixed Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Artist Manager Dashboard</h2>
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
          {activeTab === "home" && <OverviewHomeTab />}
          {activeTab === "analytics" && <OverviewAnalyticsTab />}
          {activeTab === "applications" && <OverviewApplicationsTab />}
          {activeTab === "manage" && <OverviewManageArtistsTab />}
          {activeTab === "reviews" && <ArtistReviews showNavigation={false} />}
        </div>
      </div>
    </div>
  );
};

export default Overview;
