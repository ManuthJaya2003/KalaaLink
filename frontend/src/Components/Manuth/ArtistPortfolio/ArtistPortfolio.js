import React, { useEffect, useState } from "react";
import MainNav from "../../MainNav/MainNav";
import ArtistNav from "../ArtistNav/ArtistNav";
import AuthFooter from "../../Common/AuthFooter";
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

      {/* Artist Navigation */}
      <ArtistNav />

      {/* Portfolio Section */}
      <main className="portfolio-main">
        <div className="portfolio-container">
          <h1 className="portfolio-main-title">Artist Portfolio</h1>
          <p className="portfolio-main-subtitle">Manage your profile, images, and bio to showcase your talent</p>
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
      <AuthFooter />
    </div>
  );
}

export default ArtistPortfolio;
