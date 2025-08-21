import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const BASE_URL = "http://localhost:5000/registeredArtists";

const ArtistPortfolio = () => {
  const { artist_id } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/${artist_id}`);
        setArtist(res.data.artist);
      } catch (err) {
        alert(err.response?.data?.message || "Cannot fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [artist_id]);

  if (loading) return <div>Loading portfolio...</div>;
  if (!artist) return <div>No artist found.</div>;

  return (
    <div>
      <h1>{artist.stageName}</h1>
      <p>
        {artist.firstName} {artist.lastName}
      </p>
      <p>Email: {artist.email}</p>
      <p>Bio: {artist.bio}</p>
      {/* Optional: Show artist artworks, gigs, events here */}
    </div>
  );
};

export default ArtistPortfolio;
