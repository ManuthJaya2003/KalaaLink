import React, { useEffect, useState } from "react";
import MainNav from "../MainNav/MainNav";
import axios from "axios";
import "./Artists.css";
import { useNavigate } from "react-router-dom";

const URL = "http://localhost:5000/artists";

// Fetch all artists
const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleViewDetails = (artist) => {
    setSelectedArtist(artist);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArtist(null);
  };

  const navigate = useNavigate();

  const handleBookNow = (artist) => {
    // ✅ Pass artistId using state instead of path param
    navigate("/bookArtist", { state: { artistId: artist._id } });
  };

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleCloseModal();
  };

  if (loading) {
    return (
      <div>
        <MainNav />
        <div className="loading-container">
          <h2>Loading artists...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <MainNav />
        <div className="error-container">
          <h2>{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MainNav />
      <div className="artists-container">
        <div className="artists-header">
          <h1 className="artists-title">Our Artists</h1>
          <p className="artists-subtitle">
            Discover the incredible talent we represent. Book them for your next
            event or view their stunning portfolios.
          </p>
        </div>

        {artists.length === 0 ? (
          <p>No artists found.</p>
        ) : (
          <div className="artists-grid">
            {artists.map((artist, i) => (
              <div key={i} className="artist-card">
                <div className="artist-image-container">
                  {artist.image ? (
                    <img
                      src={`http://localhost:5000/uploads/${artist.image}`}
                      alt={artist.artistName}
                      className="artist-image"
                    />
                  ) : (
                    <div
                      className="artist-image"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "1.2rem",
                        fontWeight: "600",
                      }}
                    >
                      {artist.artistName?.charAt(0) || "A"}
                    </div>
                  )}
                </div>

                <div className="artist-info">
                  <h2 className="artist-name">{artist.artistName}</h2>
                  <p className="artist-genre">{artist.genre}</p>
                  <p className="artist-category">{artist.category}</p>

                  <div className="artist-buttons">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleBookNow(artist)}
                    >
                      Book Now
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleViewDetails(artist)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedArtist && (
        <div className="modal-overlay" onClick={handleModalOverlayClick}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{selectedArtist.artistName}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {selectedArtist.image && (
                <img
                  src={`http://localhost:5000/uploads/${selectedArtist.image}`}
                  alt={selectedArtist.artistName}
                  className="modal-image"
                />
              )}

              <div className="modal-details">
                <div className="detail-item">
                  <span className="detail-label">ID</span>
                  <span className="detail-value">{selectedArtist._id}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Genre</span>
                  <span className="detail-value">{selectedArtist.genre}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">
                    {selectedArtist.category}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Booking Price</span>
                  <span className="detail-value price">
                    ${selectedArtist.bookingPrice}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Summary</span>
                  <span className="detail-value">{selectedArtist.summary}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Bio</span>
                  <span className="detail-value">{selectedArtist.bio}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Artists;
