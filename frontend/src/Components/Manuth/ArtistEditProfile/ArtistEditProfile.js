import React, { useEffect, useState } from "react";
import MainNav from "../../MainNav/MainNav";
import ArtistNav from "../ArtistNav/ArtistNav";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ArtistEditProfile.css";

function ArtistEditProfile() {
  const [artist, setArtist] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [stageName, setStageName] = useState("");
  const [bookingPrice, setBookingPrice] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Retrieve stored artist once
  const storedArtist = JSON.parse(localStorage.getItem("artist"));

  useEffect(() => {
    // Redirect if not logged in
    if (!storedArtist || !storedArtist.id) {
      navigate("/login");
      return;
    }

    // Fetch artist profile only once on mount
    axios
      .get(`http://localhost:5000/registeredArtists/${storedArtist.id}`)
      .then((res) => {
        const artistData = res.data.artist;
        setArtist(artistData);
        setFirstName(artistData.firstName || "");
        setStageName(artistData.stageName || "");
        setBookingPrice(artistData.bookingPrice || "");
        setBio(artistData.bio || "");
      })
      .catch(() => navigate("/login"));

    // Empty dependency array ensures this runs only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!artist || !storedArtist.id) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/registeredArtists/${storedArtist.id}`,
        { firstName, stageName, bookingPrice, bio }
      );

      const updatedArtist = res.data.artist;
      setArtist(updatedArtist);

      // Update localStorage with same id structure
      localStorage.setItem(
        "artist",
        JSON.stringify({
          ...updatedArtist,
          id: storedArtist.id,
        })
      );

      setMessage("Profile updated successfully!");

      // Redirect to dashboard
      navigate("/artistdashboard");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile. Try again.");
    }
  };

  if (!artist) return <p>Loading...</p>;

  return (
    <div className="edit-profile-page">
      <MainNav />
      <ArtistNav />

      <main className="edit-profile-main">
        <div className="edit-profile-container">
          <h2>Edit Profile</h2>
          {message && <p className="success-message">{message}</p>}

          <form onSubmit={handleUpdate}>
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <label>Stage Name:</label>
              <input
                type="text"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
              />
            </div>

            <div>
              <label>Booking Price ($):</label>
              <input
                type="number"
                value={bookingPrice}
                onChange={(e) => setBookingPrice(e.target.value)}
              />
            </div>

            <div>
              <label>Bio:</label>
              <textarea
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>

            <button type="submit">Save Changes</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ArtistEditProfile;
