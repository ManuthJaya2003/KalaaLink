import React, { useState } from 'react';
import ArtistManagerNav from '../ArtistManagerNav/ArtistManagerNav';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Artist() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    artistName: "",
    genre: "",
    otherGenre: "", // for specifying if Other is chosen
    category: "",
    bookingPrice: "",
    summary: "",
    bio: "",
    image: null,
  });

  const [preview, setPreview] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputs(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const sendRequest = async () => {
    const formData = new FormData();
    formData.append("artistName", inputs.artistName);
    // Send genre or otherGenre depending on choice
    formData.append("genre", inputs.genre === "Other" ? inputs.otherGenre : inputs.genre);
    formData.append("category", inputs.category);
    formData.append("bookingPrice", inputs.bookingPrice);
    formData.append("summary", inputs.summary);
    formData.append("bio", inputs.bio);
    if (inputs.image) {
      formData.append("image", inputs.image);
    }

    try {
      const res = await axios.post("http://localhost:5000/artists", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (error) {
      console.error("Failed to send request", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendRequest();
      navigate('/artists');
    } catch (error) {
      // error handling here
    }
  };

  return (
    <div>
      <ArtistManagerNav />
      <h1>Add New Artist</h1>

      <form style={{ maxWidth: "500px" }} onSubmit={handleSubmit}>
        <label>
          Artist Name:
          <input type="text" name="artistName" value={inputs.artistName} onChange={handleChange} />
        </label>

        <br /><br />

        <label>
          Genre:
          <select name="genre" value={inputs.genre} onChange={handleChange}>
            <option value="">Select Genre</option>
            <option value="Dancer">Dancer</option>
            <option value="Singer">Singer</option>
            <option value="Artist">Artist</option>
            <option value="Other">Other</option>
          </select>
        </label>

        {inputs.genre === "Other" && (
          <>
            <br /><br />
            <label>
              Please specify:
              <input
                type="text"
                name="otherGenre"
                value={inputs.otherGenre}
                onChange={handleChange}
              />
            </label>
          </>
        )}

        <br /><br />

        <label>
          Category:
          <input type="text" name="category" value={inputs.category} onChange={handleChange} />
        </label>

        <br /><br />

        <label>
          Booking Price:
          <input
            type="number"
            name="bookingPrice"
            min="0"
            step="0.01"
            value={inputs.bookingPrice}
            onChange={handleChange}
          />
        </label>

        <br /><br />

        <label>
          Summary:
          <textarea name="summary" rows="3" value={inputs.summary} onChange={handleChange} />
        </label>

        <br /><br />

        <label>
          Bio:
          <textarea name="bio" rows="5" value={inputs.bio} onChange={handleChange} />
        </label>

        <br /><br />

        <label>
          Choose Image:
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        <br />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{ width: "150px", height: "150px", objectFit: "cover", marginTop: "10px" }}
          />
        )}

        <br /><br />

        <button type="submit">Add Artist</button>
      </form>
    </div>
  );
}

export default Artist;
