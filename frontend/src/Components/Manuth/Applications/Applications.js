import React, { useEffect, useState } from "react";
import MainNav from "../../MainNav/MainNav";
import ArtistManagerNav from "../ArtistManagerNav/ArtistManagerNav";
import "./Applications.css";
import axios from "axios";
import emailjs from "emailjs-com";
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
    
    // Find the artist data to get email and name for notification
    const artist = pendingArtists.find(artist => artist._id === id);
    
    // Send email notification if artist data is available
    if (artist && artist.email) {
      try {
        const templateParams = {
          artist_name: artist.stageName || `${artist.firstName || artist.firstname || ""} ${artist.lastName || artist.lastname || ""}`.trim(),
          artist_email: artist.email,
          to_email: artist.email
        };

        await emailjs.send(
          'service_1uxn9p8',
          'template_b0u1rzq',
          templateParams,
          'Iyq-2jKYLb9Tri5Qd'
        );
        
        console.log('Approval email sent successfully to:', artist.email);
      } catch (emailErr) {
        console.error('Failed to send approval email:', emailErr);
        // Don't fail the approval process if email fails
      }
    }
    
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

  if (loading) return <div>Loading applications...</div>;

  const nameLine = (artist) =>
    `${artist.firstName || artist.firstname || ""} ${artist.lastName || artist.lastname || ""}`.trim();

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
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <ArtistManagerNav />

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
  );
};

export default Applications;
