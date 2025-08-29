import React, { useEffect, useState } from "react";
import MainNav from "../../MainNav/MainNav";
import ArtistNav from "../ArtistNav/ArtistNav.js"; // updated nav with Dashboard, Portfolio, Events
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ArtistDashboard() {
  const [artist, setArtist] = useState(null);
  const navigate = useNavigate();

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem("artist"); // clear session
    navigate("/login"); // redirect to login page
  };

  // Navigate to Edit Profile
  const handleEditProfile = () => {
    navigate("/artist/editprofile");
  };

  // Handle Delete Profile
  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile? This cannot be undone.")) return;

    try {
      const storedArtist = JSON.parse(localStorage.getItem("artist"));
      await axios.delete(`http://localhost:5000/registeredArtists/${storedArtist.id}`);
      localStorage.removeItem("artist"); // clear session
      alert("Your profile has been deleted successfully.");
      navigate("/login"); // redirect to login page
    } catch (err) {
      console.error(err);
      alert("Failed to delete profile. Please try again.");
    }
  };

  // Fetch artist info on page load
  useEffect(() => {
    const storedArtist = JSON.parse(localStorage.getItem("artist"));
    if (!storedArtist) {
      // If no artist session, redirect to login
      navigate("/login");
      return;
    }

    // Optionally, fetch full artist profile from backend
    axios
      .get(`http://localhost:5000/registeredArtists/${storedArtist.id}`)
      .then((res) => setArtist(res.data.artist))
      .catch((err) => {
        console.error(err);
        navigate("/login"); // If error, redirect to login
      });
  }, [navigate]);

  if (!artist) return <p>Loading...</p>;

  return (
    <div className="dashboard-page">
      <MainNav />

      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-container">
          <div className="dashboard-header-left">
            <h1 className="dashboard-header-title">Artist Dashboard</h1>
            <p className="dashboard-welcome-message">
              Welcome back, {artist.firstName}! Manage your portfolio and bookings efficiently.
            </p>
          </div>
          <button className="dashboard-signout-btn" onClick={handleSignOut}>
            <svg
              className="signout-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Updated Artist Nav */}
      <ArtistNav />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Main dashboard content */}
          <p><strong>Your email:</strong> {artist.email}</p>
          <p><strong>Stage Name:</strong> {artist.stageName}</p>
          <p><strong>Bio:</strong> {artist.bio}</p>
          <p><strong>Booking Price:</strong> ${artist.bookingPrice || "Not set"}</p>

          {/* Edit Profile Button */}
          <button className="edit-profile-btn" onClick={handleEditProfile}>
            Edit Profile
          </button>

          {/* Delete Profile Button */}
          <button
            className="delete-profile-btn"
            style={{ marginLeft: "10px", backgroundColor: "#e74c3c", color: "#fff" }}
            onClick={handleDeleteProfile}
          >
            Delete Profile
          </button>
        </div>
      </main>
    </div>
  );
}

export default ArtistDashboard;
