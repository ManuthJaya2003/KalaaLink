import React, { useState } from "react";
import axios from "axios";

function ArtistRegistration() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    stageName: "",
    bio: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/registeredArtists/register", form, {
        headers: { "Content-Type": "application/json" }
      });
      alert(res.data.message);
    } catch (error) {
      console.error("Error registering artist:", error.response?.data || error.message);
      alert("Error registering artist. Try again.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Artist Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="text" name="stageName" placeholder="Stage Name" onChange={handleChange} required />
        <textarea name="bio" placeholder="Your bio" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default ArtistRegistration;
