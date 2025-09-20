import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoutEmployee from "../../../utils/employeeLogout";
import "./ManageArtists.css";

const URL = "http://localhost:5000/artists";

// Utility function to construct proper image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If the path already includes "/uploads/", use it as is
  if (imagePath.startsWith("/uploads/")) {
    return `http://localhost:5000${imagePath}`;
  }
  
  // Otherwise, construct the URL with the uploads prefix
  return `http://localhost:5000/uploads/${imagePath}`;
};

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function ManageArtists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHandler()
      .then((data) => {
        setArtists(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        navigate("/addArtist");
        setError("Failed to fetch artists");
        setLoading(false);
      });
  }, [navigate]);

  // Delete handler
  const deleteHandler = async (artistId) => {
    try {
      await axios.delete(`${URL}/${artistId}`);
      setArtists((prevArtists) =>
        prevArtists.filter((artist) => artist._id !== artistId)
      );
    } catch (err) {
      console.error("Failed to delete artist:", err);
      alert("Failed to delete artist");
    }
  };

  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  const handleSignOut = () => {
    logoutEmployee(navigate, "/mainhome");
  };

  return (
    <div className="dashboard-page">
      {/* Fixed Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Dashboard</h2>
          <div className="sidebar-logo">
            <img src="/logo.png" alt="KalaaLink Logo" className="logo-icon" />
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-btn active">
            Manage Artists
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
        <div className="dashboard-content">
          <div className="section-header">
            <h1>Manage Artists</h1>
            <p className="section-subtitle">View, update, and manage artist profiles</p>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Artist Management</h3>
            </div>
            <div className="card-content">
              <Link to="/addArtist" className="btn btn-success">
                Add New Artist
              </Link>
            </div>
          </div>

          {artists.length === 0 ? (
            <div className="dashboard-card">
              <div className="card-content">
                <p>No artists found. <Link to="/addArtist" className="btn btn-outline">Add your first artist</Link></p>
              </div>
            </div>
          ) : (
            <div className="artists-grid">
              {artists.map((artist) => (
                <div key={artist._id} className="artist-card">
                  <div className="artist-image-container">
                    {artist.image ? (
                      <img
                        src={getImageUrl(artist.image)}
                        alt={artist.artistName}
                        className="artist-image"
                      />
                    ) : (
                      <div className="artist-placeholder">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="artist-content">
                    <h3 className="artist-name">{artist.artistName}</h3>
                    <div className="artist-details">
                      <div className="detail-item">
                        <span className="detail-label">Genre:</span>
                        <span className="detail-value">{artist.genre}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Category:</span>
                        <span className="detail-value">{artist.category}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Price:</span>
                        <span className="detail-value">LKR {artist.bookingPrice}</span>
                      </div>
                    </div>
                    <p className="artist-summary">{artist.summary}</p>
                    <div className="artist-actions">
                      <Link to={`/manage_artists/${artist._id || artist.artist_id}`} className="btn btn-primary">
                        Update
                      </Link>
                      <button onClick={() => deleteHandler(artist._id)} className="btn btn-secondary">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageArtists;
