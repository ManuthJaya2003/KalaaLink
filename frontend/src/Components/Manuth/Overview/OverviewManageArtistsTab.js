import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EditArtistModal from './EditArtistModal';
import AddArtistModal from './AddArtistModal';
import './AnalyticsTab.css';
import './Overview.css';
import './EditArtistModal.css';
import './AddArtistModal.css';
import '../ManageArtists/ManageArtists.css';

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

function OverviewManageArtistsTab() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchHandler()
      .then((data) => {
        setArtists(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch artists");
        setLoading(false);
      });
  }, []);

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

  // Modal handlers
  const handleEditClick = (artist) => {
    setSelectedArtist(artist);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedArtist(null);
  };

  const handleSaveArtist = (updatedArtist) => {
    setArtists(prevArtists =>
      prevArtists.map(artist =>
        artist._id === updatedArtist._id ? updatedArtist : artist
      )
    );
  };

  // Add Artist Modal handlers
  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddArtist = (newArtist) => {
    setArtists(prevArtists => [...prevArtists, newArtist]);
  };

  if (loading) return <h2>Loading artists...</h2>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div className="manage-artists-container">
      {/* Page Header */}
      <div className="analytics-page-header">
        <div>
          <h1 className="analytics-page-title">Manage Artists</h1>
          <p className="analytics-page-subtitle">Update and maintain artist profiles and information</p>
        </div>
        <button onClick={handleAddClick} className="btn btn-success">
          Add Artist
        </button>
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
                <h2 className="artist-name">{artist.artistName}</h2>
                <div className="artist-details">
                  <div className="detail-item">
                    <span className="detail-label">Genre:</span>
                    <span className="detail-value">{artist.genre || "—"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{artist.category || "—"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">LKR {artist.bookingPrice || "—"}</span>
                  </div>
                </div>
                <div className="artist-summary">
                  {artist.summary || artist.bio || "No description available"}
                </div>
                <div className="artist-actions">
                  <button onClick={() => handleEditClick(artist)} className="btn btn-primary">
                    Update
                  </button>
                  <button onClick={() => deleteHandler(artist._id)} className="btn btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Artist Modal */}
      <EditArtistModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        artist={selectedArtist}
        onSave={handleSaveArtist}
      />

      {/* Add Artist Modal */}
      <AddArtistModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleAddArtist}
      />
    </div>
  );
}

export default OverviewManageArtistsTab;
