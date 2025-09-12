import React from "react";
import { useNavigate } from "react-router-dom";
import MainNav from "../../MainNav/MainNav";
import ArtistManagerNav from "../ArtistManagerNav/ArtistManagerNav";
import ArtistReviewsDashboard from "../ArtistReviewsDashboard/ArtistReviewsDashboard";
import logoutEmployee from "../../../utils/employeeLogout";
import "./ArtistReviews.css";

function ArtistReviews() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    logoutEmployee(navigate, "/mainhome");
  };

  // Mock user name - this would come from authentication context
  const userName = "Manuth";

  const getButtonStyle = (isActive) => ({
    background: isActive ? "#34495e" : "transparent",
    border: "none",
    color: "white",
    textAlign: "left",
    padding: "10px 0",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: isActive ? "bold" : "normal",
    width: "100%",
    marginBottom: "5px",
    borderRadius: "5px",
    transition: "background-color 0.3s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Navigation Bar */}
      <div
        style={{
          background: "#34495e",
          color: "white",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #2c3e50",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          Artist Manager Dashboard
        </h1>
        <button
          onClick={handleSignOut}
          style={{
            background: "#e74c3c",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => e.target.style.background = "#c0392b"}
          onMouseLeave={(e) => e.target.style.background = "#e74c3c"}
        >
          Sign Out
        </button>
      </div>

      {/* Main Dashboard Container */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div
          style={{
            width: "220px",
            background: "#2c3e50",
            color: "white",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          <h2 style={{ marginBottom: "30px" }}>Dashboard</h2>
          <button 
            onClick={() => navigate('/overview')} 
            style={getButtonStyle(false)}
          >
            Analytics
          </button>
          <button 
            onClick={() => navigate('/applications')} 
            style={getButtonStyle(false)}
          >
            Applications
          </button>
          <button 
            onClick={() => navigate('/manage_artists')} 
            style={getButtonStyle(false)}
          >
            Manage Artists
          </button>
          <button 
            onClick={() => navigate('/addArtist')} 
            style={getButtonStyle(false)}
          >
            Add Artist
          </button>
          <button 
            onClick={() => navigate('/artist_reviews')} 
            style={getButtonStyle(true)}
          >
            Artist Reviews
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "20px" }}>
          <ArtistReviewsDashboard />
        </div>
      </div>
    </div>
  );
}

export default ArtistReviews;
