import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EventUpdate() {
  const [inputs, setInputs] = useState({});
  const [imageFile, setImageFile] = useState(null); 
  const [requestCrew, setRequestCrew] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/events/${id}`);
        const eventData = res.data.event || res.data;

        // Ensure fields exist
        setInputs({
          eventTitle: eventData.eventTitle || "",
          eventDate: eventData.eventDate ? eventData.eventDate.split("T")[0] : "",
          eventTime: eventData.eventTime || "",
          eventVenue: eventData.eventVenue || "",
          eventDescription: eventData.eventDescription || "",
          priceCustomer: eventData.priceCustomer || "",
          registrationFeeArtist: eventData.registrationFeeArtist || "",
          maxArtists: eventData.maxArtists || "",
          maxCustomers: eventData.maxCustomers || "",
        });

        setRequestCrew(eventData.crewRequest || false);
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };
    fetchHandler();
  }, [id]);

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => setImageFile(e.target.files[0]);
  const handleRequestCrewChange = (e) => setRequestCrew(e.target.checked);

  const sendRequest = async () => {
    try {
      const formData = new FormData();
      Object.entries(inputs).forEach(([key, value]) => formData.append(key, value));

      if (imageFile) formData.append("image", imageFile);

      formData.append("requestCrew", requestCrew);
      formData.append("requestedBy", "EventManagerID"); // Replace with real ID

      const res = await axios.put(`http://localhost:5000/events/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      console.error("Error updating event:", err.response || err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendRequest();
    navigate("/EventManagerDash");
  };

  return (
    <div>
      <h1>Update Event</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          name="eventTitle"
          placeholder="Title"
          value={inputs.eventTitle}
          onChange={handleChange}
          required
        />
        <input
          name="eventDate"
          type="date"
          value={inputs.eventDate}
          onChange={handleChange}
          required
        />
        <input
          name="eventTime"
          type="time"
          value={inputs.eventTime}
          onChange={handleChange}
          required
        />
        <input
          name="eventVenue"
          placeholder="Venue"
          value={inputs.eventVenue}
          onChange={handleChange}
          required
        />
        <textarea
          name="eventDescription"
          placeholder="Description"
          value={inputs.eventDescription}
          onChange={handleChange}
        />
        <input
          name="maxArtists"
          type="number"
          placeholder="Max Artists"
          value={inputs.maxArtists}
          onChange={handleChange}
          required
        />
        <input
          name="maxCustomers"
          type="number"
          placeholder="Max Customers"
          value={inputs.maxCustomers}
          onChange={handleChange}
          required
        />
        <input
          name="priceCustomer"
          type="number"
          placeholder="Price (Customer)"
          value={inputs.priceCustomer}
          onChange={handleChange}
          required
        />
        <input
          name="registrationFeeArtist"
          type="number"
          placeholder="Artist Fee"
          value={inputs.registrationFeeArtist}
          onChange={handleChange}
        />

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
        />

        <label>
          <input
            type="checkbox"
            checked={requestCrew}
            onChange={handleRequestCrewChange}
          />
          Request Crew
        </label>

        <button type="submit">Update Event</button>
      </form>
    </div>
  );
}

export default EventUpdate;
