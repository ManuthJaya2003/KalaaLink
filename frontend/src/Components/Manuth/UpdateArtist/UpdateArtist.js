import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function UpdateArtist() {
  const [inputs, setInputs] = useState({
    artistName: '',
    genre: '',
    category: '',
    bookingPrice: '',
    summary: '',
    bio: '',
    image: '' // store existing image path
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { artist_id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHandler = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/artists/${artist_id}`);

        console.log("Fetched data:", res.data);

        // ✅ Get artist object from backend response
        const artistData = res.data.artist;

        setInputs({
          artistName: artistData.artistName || '',
          genre: artistData.genre || '',
          category: artistData.category || '',
          bookingPrice: artistData.bookingPrice || '',
          summary: artistData.summary || '',
          bio: artistData.bio || '',
          image: artistData.image || ''
        });
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch artist:', err);
        setError('Failed to load artist data.');
        setLoading(false);
      }
    };

    if (artist_id) {
      fetchHandler();
    }
  }, [artist_id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setImageFile(files[0]);
    } else {
      setInputs((prev) => ({ ...prev, [name]: value }));
    }
  };

  const sendRequest = async () => {
    try {
      const formData = new FormData();
      formData.append('artistName', inputs.artistName);
      formData.append('genre', inputs.genre);
      formData.append('category', inputs.category);
      formData.append('bookingPrice', inputs.bookingPrice);
      formData.append('summary', inputs.summary);
      formData.append('bio', inputs.bio);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.put(`http://localhost:5000/artists/${artist_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/manage_artists');
    } catch (err) {
      console.error('Failed to update artist:', err);
      setError('Failed to update artist.');
    }
  };

  if (loading) return <h2>Loading artist data...</h2>;
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

  return (
    <div>
      <h1>Update Artist</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendRequest();
        }}
      >
        <input
          type="text"
          name="artistName"
          value={inputs.artistName}
          onChange={handleChange}
          placeholder="Artist Name"
          required
        />
        <br />
        <input
          type="text"
          name="genre"
          value={inputs.genre}
          onChange={handleChange}
          placeholder="Genre"
          required
        />
        <br />
        <input
          type="text"
          name="category"
          value={inputs.category}
          onChange={handleChange}
          placeholder="Category"
          required
        />
        <br />
        <input
          type="number"
          name="bookingPrice"
          value={inputs.bookingPrice}
          onChange={handleChange}
          placeholder="Booking Price"
          required
        />
        <br />
        <textarea
          name="summary"
          value={inputs.summary}
          onChange={handleChange}
          placeholder="Summary"
          required
        />
        <br />
        <textarea
          name="bio"
          value={inputs.bio}
          onChange={handleChange}
          placeholder="Bio"
          required
        />
        <br />

        {/* Show current image if available */}
        {inputs.image && !imageFile && (
          <div style={{ marginBottom: '10px' }}>
            <img
              src={`http://localhost:5000/${inputs.image}`}
              alt="Artist"
              width="150"
              style={{ border: '1px solid #ccc', padding: '4px' }}
            />
          </div>
        )}

        <input type="file" name="image" onChange={handleChange} />
        <br />
        <button type="submit">Update Artist</button>
      </form>
    </div>
  );
}

export default UpdateArtist;
