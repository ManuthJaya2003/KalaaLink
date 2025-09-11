import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Applications/Applications.css";

const BASE_URL = "http://localhost:5000/artists/applications";

function OverviewApplicationsTab() {
  const [pendingArtists, setPendingArtists] = useState([]);
  const [approvedArtists, setApprovedArtists] = useState([]);
  const [rejectedArtists, setRejectedArtists] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading applications...</div>;

  const nameLine = (artist) =>
    `${artist.firstName || artist.firstname || ""} ${artist.lastName || artist.lastname || ""}`.trim();

  return (
    <div>
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
}

export default OverviewApplicationsTab;
