import React, { useEffect, useState } from "react";
import MainNav from "../MainNav/MainNav";
import MainFooter from "../MainFooter/MainFooter";
import axios from "axios";
import "./Artists.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArtistReviewModal from "./ArtistReviewModal";
import ArtistReviewsDisplay from "./ArtistReviewsDisplay";
import AllReviewsModal from "./AllReviewsModal";

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

// Fetch all artists
const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

// Fetch all genres
const fetchGenres = async () => {
  return await axios.get(`${URL}/genres`).then((res) => res.data);
};

// Fetch categories for a specific genre
const fetchCategories = async (genre) => {
  if (!genre) return [];
  return await axios.get(`${URL}/categories/${encodeURIComponent(genre)}`).then((res) => res.data);
};

function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedArtistForReview, setSelectedArtistForReview] = useState(null);
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false);
  const [selectedArtistForAllReviews, setSelectedArtistForAllReviews] = useState(null);
  const [searchParams] = useSearchParams();
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [messageContent, setMessageContent] = useState("");
  
  // Filtering state
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);

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

  // Fetch genres on component mount
  useEffect(() => {
    fetchGenres()
      .then((data) => {
        setGenres(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch genres:", err);
      });
  }, []);

  // Fetch categories when genre changes
  useEffect(() => {
    if (selectedGenre) {
      fetchCategories(selectedGenre)
        .then((data) => {
          setCategories(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("Failed to fetch categories:", err);
          setCategories([]);
        });
    } else {
      setCategories([]);
    }
    // Reset category selection when genre changes
    setSelectedCategory("");
  }, [selectedGenre]);

  // Filter artists based on selected genre and category
  useEffect(() => {
    let filtered = artists;

    if (selectedGenre) {
      filtered = filtered.filter(artist => artist.genre === selectedGenre);
    }

    if (selectedCategory) {
      filtered = filtered.filter(artist => artist.category === selectedCategory);
    }

    setFilteredArtists(filtered);
  }, [artists, selectedGenre, selectedCategory]);

  // Handle URL parameters for payment success/cancelled
  useEffect(() => {
    const booking = searchParams.get("booking");
    const artist = searchParams.get("artist");
    const event = searchParams.get("event");

    if (booking === "success" && artist && event) {
      setMessageType("success");
      setMessageContent(`🎉 Booking confirmed for ${artist} - ${event}! Your payment was successful.`);
      setShowMessage(true);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, "/artists");
      
      // Auto-hide message after 8 seconds
      setTimeout(() => {
        setShowMessage(false);
      }, 8000);

      // Fallback: Check if we need to update any pending bookings
      // This helps if the webhook failed
      checkAndUpdatePendingBookings();
    } else if (booking === "cancelled") {
      setMessageType("cancelled");
      setMessageContent("❌ Payment was cancelled. Your booking is still saved and you can try again later.");
      setShowMessage(true);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, "/artists");
      
      // Auto-hide message after 8 seconds
      setTimeout(() => {
        setShowMessage(false);
      }, 8000);
    }
  }, [searchParams]);

  // Fallback function to check and update pending bookings
  const checkAndUpdatePendingBookings = async () => {
    try {
      // Get the session ID from URL if available
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");
      
      if (sessionId) {
        console.log("🔄 Checking for pending bookings to update...");
        
        // Call backend to check and update payment status
        const response = await fetch("http://localhost:5000/bookings/check-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: sessionId,
            customerEmail: localStorage.getItem("customerEmail") || "unknown" // You might want to store this during booking
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Payment status check result:", data);
          
          if (data.message === "Payment status updated successfully") {
            console.log("🎉 Payment status updated via fallback mechanism");
          }
        } else {
          console.log("ℹ️ Payment status check response:", response.status);
        }
      }
    } catch (error) {
      console.error("Error checking pending bookings:", error);
    }
  };

  const handleViewDetails = (artist) => {
    setSelectedArtist(artist);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArtist(null);
  };

  const handleOpenReviewModal = (artist) => {
    setSelectedArtistForReview(artist);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedArtistForReview(null);
  };

  const handleReviewSubmitted = (newReview) => {
    console.log('New review submitted:', newReview);
    // The ArtistReviewsDisplay component will automatically refresh
  };

  const handleOpenAllReviewsModal = (artist) => {
    setSelectedArtistForAllReviews(artist);
    setIsAllReviewsModalOpen(true);
  };

  const handleCloseAllReviewsModal = () => {
    setIsAllReviewsModalOpen(false);
    setSelectedArtistForAllReviews(null);
  };

  const navigate = useNavigate();

  const handleBookNow = (artist) => {
    // ✅ Pass artistId using state instead of path param
    navigate("/bookArtist", { state: { artistId: artist._id } });
  };

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleCloseModal();
  };

  // Filter handlers
  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleClearFilters = () => {
    setSelectedGenre("");
    setSelectedCategory("");
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

        {/* Payment Status Messages */}
        {showMessage && (
          <div className={`payment-message ${messageType}`}>
            <div className="message-content">
              <span className="message-text">{messageContent}</span>
              <button 
                className="message-close" 
                onClick={() => setShowMessage(false)}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="genre-filter" className="filter-label">Genre:</label>
            <select
              id="genre-filter"
              className="filter-select"
              value={selectedGenre}
              onChange={handleGenreChange}
            >
              <option value="">All Genres</option>
              {genres.map((genre, index) => (
                <option key={index} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category-filter" className="filter-label">Category:</label>
            <select
              id="category-filter"
              className="filter-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
              disabled={!selectedGenre}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <button
            className="clear-btn"
            onClick={handleClearFilters}
            disabled={!selectedGenre && !selectedCategory}
          >
            Clear Filters
          </button>
        </div>

        {filteredArtists.length === 0 ? (
          <p>No artists found.</p>
        ) : (
          <div className="artists-grid">
            {filteredArtists.map((artist, i) => (
              <div key={i} className="artist-card">
                <div className="artist-image-container">
                  {artist.image ? (
                    <img
                      src={getImageUrl(artist.image)}
                      alt={artist.artistName}
                      className="artist-image"
                    />
                  ) : (
                    <div className="artist-image-fallback">
                      {artist.artistName?.charAt(0) || "A"}
                    </div>
                  )}
                </div>

                <div className="artist-info">
                  <h2 className="artist-name">{artist.artistName}</h2>
                  <p className="artist-genre">{artist.genre}</p>
                  <p className="artist-category">{artist.category}</p>
                  <p className="artist-bio">{artist.bio || artist.summary || 'Professional artist ready to bring creativity to your event.'}</p>

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
                    <button
                      className="btn btn-review"
                      onClick={() => handleOpenReviewModal(artist)}
                    >
                      ✨ Leave a Review
                    </button>
                  </div>
                </div>

                {/* Reviews Display - moved outside artist-info */}
                <ArtistReviewsDisplay 
                  artistId={artist._id} 
                  artist={artist} 
                  onViewMoreReviews={handleOpenAllReviewsModal}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <MainFooter />

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
                  src={getImageUrl(selectedArtist.image)}
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
                    LKR {selectedArtist.bookingPrice}
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

      {/* Review Modal */}
      {isReviewModalOpen && selectedArtistForReview && (
        <ArtistReviewModal
          artist={selectedArtistForReview}
          isOpen={isReviewModalOpen}
          onClose={handleCloseReviewModal}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* All Reviews Modal - Global Modal */}
      {isAllReviewsModalOpen && selectedArtistForAllReviews && (
        <AllReviewsModal
          artist={selectedArtistForAllReviews}
          isOpen={isAllReviewsModalOpen}
          onClose={handleCloseAllReviewsModal}
        />
      )}
    </div>
  );
}

export default Artists;
