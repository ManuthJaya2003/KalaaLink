import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OverviewApplicationsTab.css";

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

  const clearRejectedArtists = async () => {
    if (rejectedArtists.length === 0) {
      alert("No rejected artists to clear.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete all ${rejectedArtists.length} rejected artists? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const res = await axios.delete(`${BASE_URL}/clear-rejected`);
      // Refresh the lists from the backend
      await fetchApplications();
      alert(res.data.message || "All rejected artists cleared successfully!");
    } catch (err) {
      console.error("Error clearing rejected artists:", err);
      alert("Failed to clear rejected artists.");
    }
  };

  if (loading) return <div className="loading">Loading applications...</div>;

  const nameLine = (artist) =>
    `${artist.firstName || artist.firstname || ""} ${artist.lastName || artist.lastname || ""}`.trim();

  return (
    <div className="overview-applications-container">
      {/* Pending Applications Table */}
      <div className="applications-section">
        <div className="section-header">
          <h2 className="section-title pending">
            <span className="status-icon">⏳</span>
            Pending Applications ({pendingArtists.length})
          </h2>
        </div>
        {pendingArtists.length === 0 ? (
          <div className="empty-state">
            <p>No pending applications.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="applications-table pending-table">
              <thead>
                <tr>
                  <th>Stage Name</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Bio</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingArtists.map((artist) => (
                  <tr key={artist._id} className="application-row">
                    <td className="stage-name">
                      <strong>{artist.stageName || "Unnamed Artist"}</strong>
                    </td>
                    <td className="full-name">{nameLine(artist) || "—"}</td>
                    <td className="email">{artist.email || "—"}</td>
                    <td className="bio">
                      <div className="bio-content">
                        {artist.bio ? (artist.bio.length > 100 ? `${artist.bio.substring(0, 100)}...` : artist.bio) : "—"}
                      </div>
                    </td>
                    <td className="applied-date">
                      {artist.createdAt ? new Date(artist.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="actions">
                      <div className="action-buttons">
                        <button onClick={() => approveArtist(artist._id)} className="btn-approve">
                          ✅ Approve
                        </button>
                        <button onClick={() => rejectArtist(artist._id)} className="btn-reject">
                          ❌ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approved Artists Table */}
      <div className="applications-section">
        <div className="section-header">
          <h2 className="section-title approved">
            <span className="status-icon">✅</span>
            Approved Artists ({approvedArtists.length})
          </h2>
        </div>
        {approvedArtists.length === 0 ? (
          <div className="empty-state">
            <p>No approved artists yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="applications-table approved-table">
              <thead>
                <tr>
                  <th>Stage Name</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Bio</th>
                  <th>Approved Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {approvedArtists.map((artist) => (
                  <tr key={artist._id} className="application-row approved-row">
                    <td className="stage-name">
                      <strong>{artist.stageName || "Unnamed Artist"}</strong>
                    </td>
                    <td className="full-name">{nameLine(artist) || "—"}</td>
                    <td className="email">{artist.email || "—"}</td>
                    <td className="bio">
                      <div className="bio-content">
                        {artist.bio ? (artist.bio.length > 100 ? `${artist.bio.substring(0, 100)}...` : artist.bio) : "—"}
                      </div>
                    </td>
                    <td className="approved-date">
                      {artist.updatedAt ? new Date(artist.updatedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="status">
                      <span className="status-badge approved-badge">✅ Approved</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejected Artists Table */}
      <div className="applications-section">
        <div className="section-header">
          <h2 className="section-title rejected">
            <span className="status-icon">❌</span>
            Rejected Artists ({rejectedArtists.length})
          </h2>
          {rejectedArtists.length > 0 && (
            <button 
              onClick={clearRejectedArtists} 
              className="btn-clear-rejected"
              title="Clear all rejected artists"
            >
              🗑️ Clear All
            </button>
          )}
        </div>
        {rejectedArtists.length === 0 ? (
          <div className="empty-state">
            <p>No rejected artists.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="applications-table rejected-table">
              <thead>
                <tr>
                  <th>Stage Name</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Bio</th>
                  <th>Rejected Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rejectedArtists.map((artist) => (
                  <tr key={artist._id} className="application-row rejected-row">
                    <td className="stage-name">
                      <strong>{artist.stageName || "Unnamed Artist"}</strong>
                    </td>
                    <td className="full-name">{nameLine(artist) || "—"}</td>
                    <td className="email">{artist.email || "—"}</td>
                    <td className="bio">
                      <div className="bio-content">
                        {artist.bio ? (artist.bio.length > 100 ? `${artist.bio.substring(0, 100)}...` : artist.bio) : "—"}
                      </div>
                    </td>
                    <td className="rejected-date">
                      {artist.updatedAt ? new Date(artist.updatedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="status">
                      <span className="status-badge rejected-badge">❌ Rejected</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OverviewApplicationsTab;
