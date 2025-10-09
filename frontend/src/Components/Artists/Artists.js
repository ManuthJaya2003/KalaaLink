import React, { useEffect, useState } from "react";
import MainNav from "../MainNav/MainNav";
import MainFooter from "../MainFooter/MainFooter";
import axios from "axios";
import "./Artists.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReviewModal from "./ReviewModal";
import ViewReviewsModal from "./ViewReviewsModal";
import StarRating from "../Common/StarRating";
import Chatbot from "../Chatbot/Chatbot";

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
  const [searchParams] = useSearchParams();
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [messageContent, setMessageContent] = useState("");
  
  // Review-related state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isViewReviewsModalOpen, setIsViewReviewsModalOpen] = useState(false);
  const [artistReviews, setArtistReviews] = useState({});
  const [artistRatings, setArtistRatings] = useState({});
  const [currentReviewIndex, setCurrentReviewIndex] = useState({});
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState("");
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

  // Fetch reviews and ratings for all artists
  useEffect(() => {
    if (artists.length > 0) {
      fetchAllArtistReviews();
    }
  }, [artists]);

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

  // Filter artists based on search term, selected genre and category
  useEffect(() => {
    let filtered = artists;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(artist => 
        artist.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artist.bio && artist.bio.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter(artist => artist.genre === selectedGenre);
    }

    if (selectedCategory) {
      filtered = filtered.filter(artist => artist.category === selectedCategory);
    }

    setFilteredArtists(filtered);
  }, [artists, searchTerm, selectedGenre, selectedCategory]);

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

  const navigate = useNavigate();

  const handleBookNow = (artist) => {
    // ✅ Pass artistId using state instead of path param
    navigate("/bookArtist", { state: { artistId: artist._id } });
  };

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleCloseModal();
  };

  // Filter handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedGenre("");
    setSelectedCategory("");
  };

  // Fetch reviews and ratings for all artists
  const fetchAllArtistReviews = async () => {
    const reviewsData = {};
    const ratingsData = {};

    for (const artist of artists) {
      try {
        // Fetch reviews
        const reviewsResponse = await axios.get(`http://localhost:5000/api/artist-reviews/${artist._id}`);
        if (reviewsResponse.data.success) {
          reviewsData[artist._id] = reviewsResponse.data.reviews;
        }

        // Fetch average rating
        const ratingResponse = await axios.get(`http://localhost:5000/api/artist-reviews/${artist._id}/average`);
        if (ratingResponse.data.success) {
          ratingsData[artist._id] = {
            averageRating: ratingResponse.data.averageRating,
            totalReviews: ratingResponse.data.totalReviews
          };
        }
      } catch (error) {
        console.error(`Error fetching reviews for artist ${artist._id}:`, error);
        // Handle different types of errors
        if (error.response?.status === 404) {
          console.log(`Artist ${artist._id} not found in database, skipping reviews`);
        } else {
          console.error(`Unexpected error for artist ${artist._id}:`, error.response?.data || error.message);
        }
        reviewsData[artist._id] = [];
        ratingsData[artist._id] = { averageRating: 0, totalReviews: 0 };
      }
    }

    setArtistReviews(reviewsData);
    setArtistRatings(ratingsData);
  };

  // Handle opening review modal
  const handlePostReview = (artist) => {
    setSelectedArtist(artist);
    setIsReviewModalOpen(true);
  };

  // Handle opening view reviews modal
  const handleViewReviews = (artist) => {
    setSelectedArtist(artist);
    setIsViewReviewsModalOpen(true);
  };

  // Review navigation functions
  const handlePreviousReview = (artistId) => {
    const reviews = artistReviews[artistId] || [];
    const currentIndex = currentReviewIndex[artistId] || 0;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : reviews.length - 1;
    setCurrentReviewIndex(prev => ({
      ...prev,
      [artistId]: newIndex
    }));
  };

  const handleNextReview = (artistId) => {
    const reviews = artistReviews[artistId] || [];
    const currentIndex = currentReviewIndex[artistId] || 0;
    const newIndex = currentIndex < reviews.length - 1 ? currentIndex + 1 : 0;
    setCurrentReviewIndex(prev => ({
      ...prev,
      [artistId]: newIndex
    }));
  };

  // Handle review submission
  const handleReviewSubmitted = (newReview) => {
    // Update the reviews for this artist
    const artistId = selectedArtist._id;
    setArtistReviews(prev => ({
      ...prev,
      [artistId]: [newReview, ...(prev[artistId] || [])]
    }));

    // Recalculate average rating
    fetchArtistRating(artistId);
  };

  // Fetch rating for a specific artist
  const fetchArtistRating = async (artistId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/artist-reviews/${artistId}/average`);
      if (response.data.success) {
        setArtistRatings(prev => ({
          ...prev,
          [artistId]: {
            averageRating: response.data.averageRating,
            totalReviews: response.data.totalReviews
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching artist rating:', error);
    }
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
      
      {/* Hero Video Section */}
      <div className="artists-hero-video">
        <video
          className="artists-background-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/artist-hero-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="artists-container">
        {/* Explore Artists Text */}
        <div className="explore-artists-text">
          <h2 className="artists-title">Explore our amazing artists</h2>
          <p className="artists-subtitle">Discover talented artists across various genres and categories.</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-filter-left">
            <div className="search-group">
              <input
                type="text"
                placeholder="Search artists..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button className="search-button" onClick={() => {}}>
                Search
              </button>
            </div>
          </div>

          <div className="search-filter-right">
            <div className="filter-group">
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
              disabled={!searchTerm && !selectedGenre && !selectedCategory}
            >
              Clear Filters
            </button>
          </div>
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

                  {/* Review Section */}
                  <div className={`artist-reviews-section ${(!artistRatings[artist._id] || artistRatings[artist._id].totalReviews === 0) ? 'no-reviews-section' : ''}`}>
                    {artistRatings[artist._id] && artistRatings[artist._id].totalReviews > 0 ? (
                      <>
                        <div className="rating-display">
                          <StarRating rating={Math.round(artistRatings[artist._id].averageRating)} size="small" />
                          <span className="rating-text">
                            {artistRatings[artist._id].averageRating.toFixed(1)} ({artistRatings[artist._id].totalReviews} review{artistRatings[artist._id].totalReviews !== 1 ? 's' : ''})
                          </span>
                        </div>
                        {artistReviews[artist._id] && artistReviews[artist._id].length > 0 && (
                          <div className="latest-review">
                            <div className="review-navigation">
                              {artistReviews[artist._id].length > 1 && (
                                <button 
                                  className="review-nav-btn prev-btn"
                                  onClick={() => handlePreviousReview(artist._id)}
                                  title="Previous review"
                                >
                                  ‹
                                </button>
                              )}
                              <div className="review-content">
                                <p className="review-snippet">
                                  "{artistReviews[artist._id][currentReviewIndex[artist._id] || 0].review.substring(0, 80)}
                                  {artistReviews[artist._id][currentReviewIndex[artist._id] || 0].review.length > 80 ? '...' : ''}"
                                </p>
                                <p className="review-author">- {artistReviews[artist._id][currentReviewIndex[artist._id] || 0].customerName}</p>
                              </div>
                              {artistReviews[artist._id].length > 1 && (
                                <button 
                                  className="review-nav-btn next-btn"
                                  onClick={() => handleNextReview(artist._id)}
                                  title="Next review"
                                >
                                  ›
                                </button>
                              )}
                            </div>
                            {artistReviews[artist._id].length > 1 && (
                              <div className="review-indicators">
                                <span className="review-counter">
                                  {(currentReviewIndex[artist._id] || 0) + 1} of {artistReviews[artist._id].length}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="no-reviews">
                        <span className="no-reviews-text">No reviews</span>
                      </div>
                    )}
                  </div>

                  <div className="artist-buttons">
                    <div className="artist-buttons-row">
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
                    <div className="artist-buttons-column">
                      <button
                        className="btn btn-review btn-wide"
                        onClick={() => handlePostReview(artist)}
                      >
                        Post Review
                      </button>
                      {artistRatings[artist._id] && artistRatings[artist._id].totalReviews > 0 && (
                        <button
                          className="btn btn-reviews btn-wide"
                          onClick={() => handleViewReviews(artist)}
                        >
                          View Reviews
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MainFooter />

      <Chatbot />

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
                <div className="detail-item" style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0px', width: '100%', marginBottom: '8px'}}>
                  <span className="detail-label" style={{width: '80px', minWidth: '80px', maxWidth: '80px', flexShrink: 0, margin: 0, padding: 0}}>Genre</span>
                  <span className="detail-value" style={{flex: '0 0 auto', margin: 0, padding: 0, marginLeft: '0px'}}>{selectedArtist.genre}</span>
                </div>

                <div className="detail-item" style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0px', width: '100%', marginBottom: '8px'}}>
                  <span className="detail-label" style={{width: '80px', minWidth: '80px', maxWidth: '80px', flexShrink: 0, margin: 0, padding: 0}}>Category</span>
                  <span className="detail-value" style={{flex: '0 0 auto', margin: 0, padding: 0, marginLeft: '0px'}}>
                    {selectedArtist.category}
                  </span>
                </div>

                <div className="detail-item" style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0px', width: '100%'}}>
                  <span className="detail-label" style={{width: '80px', minWidth: '80px', maxWidth: '80px', flexShrink: 0, margin: 0, padding: 0}}>Booking Price</span>
                  <span className="detail-value price" style={{flex: '0 0 auto', margin: 0, padding: 0, marginLeft: '0px'}}>
                    LKR {selectedArtist.bookingPrice}
                  </span>
                </div>

                <div className="detail-item" style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '0px', width: '100%', marginBottom: '8px'}}>
                  <span className="detail-label" style={{width: '80px', minWidth: '80px', maxWidth: '80px', flexShrink: 0, margin: 0, padding: 0}}>Summary</span>
                  <span className="detail-value" style={{flex: '0 0 auto', margin: 0, padding: 0, marginLeft: '0px'}}>{selectedArtist.summary}</span>
                </div>

                <div className="detail-item" style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '0px', width: '100%', marginBottom: '8px'}}>
                  <span className="detail-label" style={{width: '80px', minWidth: '80px', maxWidth: '80px', flexShrink: 0, margin: 0, padding: 0}}>Bio</span>
                  <span className="detail-value" style={{flex: '0 0 auto', margin: 0, padding: 0, marginLeft: '0px'}}>{selectedArtist.bio}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        artist={selectedArtist}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* View Reviews Modal */}
      <ViewReviewsModal
        isOpen={isViewReviewsModalOpen}
        onClose={() => setIsViewReviewsModalOpen(false)}
        artist={selectedArtist}
      />
    </div>
  );
}

export default Artists;
