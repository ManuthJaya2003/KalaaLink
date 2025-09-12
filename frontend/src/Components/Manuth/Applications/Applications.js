import React, { useEffect, useState } from "react";
import MainNav from "../../MainNav/MainNav";
import ArtistManagerNav from "../ArtistManagerNav/ArtistManagerNav";
import "./Applications.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000/artists/applications";

const Applications = () => {
  const [pendingArtists, setPendingArtists] = useState([]);
  const [approvedArtists, setApprovedArtists] = useState([]);
  const [rejectedArtists, setRejectedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      const res = await axios.get(BASE_URL);
      const data = res.data;

      // Backend now returns { pending, approved, rejected }
      if (data.pending && data.approved && data.rejected) {
        setPendingArtists(data.pending);
        setApprovedArtists(data.approved);
        setRejectedArtists(data.rejected);
      } else {
        const arr = Array.isArray(data) ? data : [];
        setPendingArtists(arr);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const approveArtist = async (id) => {
  try {
    const res = await axios.put(`${BASE_URL}/approve/${id}`);
    // Refresh the lists from the backend
    await fetchApplications();
    alert(res.data.message || "Artist approved successfully!");
  } catch (err) {
    console.error("Error approving artist:", err);
    alert("Failed to approve artist.");
  }
};

const rejectArtist = async (id) => {
  try {
    const res = await axios.put(`${BASE_URL}/reject/${id}`);
    // Refresh the lists from the backend
    await fetchApplications();
    alert(res.data.message || "Artist rejected!");
  } catch (err) {
    console.error("Error rejecting artist:", err);
    alert("Failed to reject artist.");
  }
};

  const handleSignOut = () => {
    navigate("/mainhome");
  };

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

  if (loading) return <div>Loading applications...</div>;

  const nameLine = (artist) =>
    `${artist.firstName || artist.firstname || ""} ${artist.lastName || artist.lastname || ""}`.trim();

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
            style={getButtonStyle(true)}
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
            style={getButtonStyle(false)}
          >
            Artist Reviews
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "20px" }}>

      {/* Pending Applications */}
      <h2>Pending Applications</h2>
      {pendingArtists.length === 0 ? (
        <p>No pending applications.</p>
      ) : (
        <div className="applications-list">
          {pendingArtists.map((artist) => (
            <div className="application-card" key={artist._id}>
              <h3>{artist.stageName || "Unnamed Artist"}</h3>
              <p>Name: {nameLine(artist) || "—"}</p>
              <p>Email: {artist.email || "—"}</p>
              <p>Bio: {artist.bio || "—"}</p>
              <div className="application-actions">
                <button onClick={() => approveArtist(artist._id)} className="approve-btn">
                  Approve
                </button>
                <button onClick={() => rejectArtist(artist._id)} className="reject-btn">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approved Artists */}
      <h2>Approved Artists</h2>
      {approvedArtists.length === 0 ? (
        <p>No approved artists yet.</p>
      ) : (
        <div className="applications-list">
          {approvedArtists.map((artist) => (
            <div className="application-card approved" key={artist._id}>
              <h3>{artist.stageName || "Unnamed Artist"}</h3>
              <p>Name: {nameLine(artist) || "—"}</p>
              <p>Email: {artist.email || "—"}</p>
              <p>Bio: {artist.bio || "—"}</p>
              <span className="approved-label">✅ Approved</span>
            </div>
          ))}
        </div>
      )}

      {/* Rejected Artists */}
      <h2>Rejected Artists</h2>
      {rejectedArtists.length === 0 ? (
        <p>No rejected artists.</p>
      ) : (
        <div className="applications-list">
          {rejectedArtists.map((artist) => (
            <div className="application-card rejected" key={artist._id}>
              <h3>{artist.stageName || "Unnamed Artist"}</h3>
              <p>Name: {nameLine(artist) || "—"}</p>
              <p>Email: {artist.email || "—"}</p>
              <p>Bio: {artist.bio || "—"}</p>
              <span className="rejected-label">❌ Rejected</span>
            </div>
          ))}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
