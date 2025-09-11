import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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

  if (loading) return <h2>Loading artists...</h2>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div>
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
  );
}

export default OverviewManageArtistsTab;
