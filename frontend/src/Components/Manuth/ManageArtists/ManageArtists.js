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

  const getButtonStyle = (isActive) => ({
    background: isActive ? "#34495e" : "transparent",
    border: "none",
    color: "white",
    textAlign: "left",
    padding: "10px 0",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: isActive ? "bold" : "normal",
    width: "100%",
    marginBottom: "5px",
    borderRadius: "5px",
    transition: "background-color 0.3s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Navigation Bar */}
      <div
        style={{
          background: "#34495e",
          color: "white",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #2c3e50",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          Artist Manager Dashboard
        </h1>
        <button
          onClick={handleSignOut}
          style={{
            background: "#e74c3c",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => e.target.style.background = "#c0392b"}
          onMouseLeave={(e) => e.target.style.background = "#e74c3c"}
        >
          Sign Out
        </button>
      </div>

      {/* Main Dashboard Container */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div
          style={{
            width: "220px",
            background: "#2c3e50",
            color: "white",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          <h2 style={{ marginBottom: "30px" }}>Dashboard</h2>
          <button 
            onClick={() => navigate('/overview')} 
            style={getButtonStyle(false)}
          >
            Analytics
          </button>
          <button 
            onClick={() => navigate('/applications')} 
            style={getButtonStyle(false)}
          >
            Applications
          </button>
          <button 
            onClick={() => navigate('/manage_artists')} 
            style={getButtonStyle(true)}
          >
            Manage Artists
          </button>
          <button 
            onClick={() => navigate('/addArtist')} 
            style={getButtonStyle(false)}
          >
            Add Artist
          </button>
          <button 
            onClick={() => navigate('/artist_reviews')} 
            style={getButtonStyle(false)}
          >
            Artist Reviews
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "20px" }}>

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
            <p><strong>Booking Price:</strong> LKR {artist.bookingPrice}</p>
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
      </div>
    </div>
  );
}

export default ManageArtists;
