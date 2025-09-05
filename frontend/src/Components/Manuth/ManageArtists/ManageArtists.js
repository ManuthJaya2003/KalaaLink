import React, { useEffect, useState } from 'react';
import ArtistManagerNav from '../ArtistManagerNav/ArtistManagerNav';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainNav from "../../MainNav/MainNav";

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

  if (loading) return <h2>Loading artists...</h2>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  const handleSignOut = () => {
    navigate("/mainhome");
  };

  // Mock user name - this would come from authentication context
  const userName = "Manuth";


  return (
    <div>
      <MainNav/>

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
            <svg className="signout-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <ArtistManagerNav />

      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        <li>
          <Link to="/addArtist" style={{ textDecoration: 'none', color: 'blue' }}>
            Add Artist
          </Link>
        </li>
      </ul>

      <h1>Manage Artists</h1>

      {artists.length === 0 ? (
        <p>No artists found.</p>
      ) : (
        artists.map((artist) => (
          <div
            key={artist._id}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
            }}
          >
            <h2>{artist.artistName}</h2>
            <p><strong>ID:</strong> {artist._id || artist.artist_id}</p>
            <p><strong>Genre:</strong> {artist.genre}</p>
            <p><strong>Category:</strong> {artist.category}</p>
            <p><strong>Booking Price:</strong> {artist.bookingPrice}</p>
            <p><strong>Summary:</strong> {artist.summary}</p>
            <p><strong>Bio:</strong> {artist.bio}</p>
            {artist.image && (
              <img
                src={getImageUrl(artist.image)}
                alt={artist.artistName}
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            )}
            <div style={{ marginTop: "10px" }}>
              <Link to={`/manage_artists/${artist._id || artist.artist_id}`}>
                <button style={{ marginRight: "10px" }}>Update</button>
              </Link>
              <button onClick={() => deleteHandler(artist._id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ManageArtists;
