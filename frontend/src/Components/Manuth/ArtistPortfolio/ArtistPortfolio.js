import React, { useEffect, useState } from "react";
import MainNav from "../../MainNav/MainNav";
import ArtistNav from "../ArtistNav/ArtistNav";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ArtistPortfolio.css";

function ArtistPortfolio() {
  const [artist, setArtist] = useState(null);
  const [bio, setBio] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem("artist");
    navigate("/login");
  };

  // Load artist data on mount
  useEffect(() => {
    const storedArtist = JSON.parse(localStorage.getItem("artist"));
    if (!storedArtist) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:5000/registeredArtists/${storedArtist.id}`)
      .then((res) => {
        setArtist(res.data.artist);
        setBio(res.data.artist.bio || "");
      })
      .catch((err) => {
        console.error(err);
        navigate("/login");
      });
  }, [navigate]);

  // Handle portfolio update (bio + images)
  const handlePortfolioUpdate = async (e) => {
    e.preventDefault();
    if (!artist) return;

    const formData = new FormData();
    formData.append("bio", bio);

    // 🔑 Must match backend field names
    if (profileFile) formData.append("profileImage", profileFile);
    if (coverFile) formData.append("coverImage", coverFile);

    try {
      const res = await axios.put(
        `http://localhost:5000/registeredArtists/${artist._id}/images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setArtist(res.data.artist); // update state with new images & bio
      setMessage("Portfolio updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update portfolio. Try again.");
    }
  };

  if (!artist) return <p>Loading...</p>;

  return (
    <div className="portfolio-page">
      <MainNav />

      {/* Header */}
      <header className="portfolio-header">
        <div className="portfolio-header-container">
          <div className="portfolio-header-left">
            <h1 className="portfolio-header-title">Artist Portfolio</h1>
            <p className="portfolio-welcome-message">
              Manage your profile, images, and bio here,{" "}
              {artist.firstName || artist.stageName}.
            </p>
          </div>
          <button className="portfolio-signout-btn" onClick={handleSignOut}>
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

      {/* Artist Navigation */}
      <ArtistNav />

      {/* Portfolio Section */}
      <main className="portfolio-main">
        <div className="portfolio-container">
          <h2 className="portfolio-subtitle">Manage Your Portfolio</h2>
          {message && <p>{message}</p>}

          <form onSubmit={handlePortfolioUpdate}>
            <div>
              <label>Profile Picture:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileFile(e.target.files[0])}
              />
              {artist.profileImage && (
                <img
                  src={`http://localhost:5000${artist.profileImage}`}
                  alt="Profile"
                  className="artist-profile-preview"
                />
              )}
            </div>

            <div>
              <label>Cover Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files[0])}
              />
              {artist.coverImage && (
                <img
                  src={`http://localhost:5000${artist.coverImage}`}
                  alt="Cover"
                  className="artist-cover-preview"
                />
              )}
            </div>

            <div>
              <label>Bio:</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="4"
              />
            </div>

            <button type="submit">Update Portfolio</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ArtistPortfolio;
