import React, { useState } from "react";
import axios from "axios";

const URL = "http://localhost:5000/events";

function OrganizeEventForm({ events, setEvents, eventManagerId }) {
  const [form, setForm] = useState({
    eventTitle: "",
    eventDate: "",
    eventTime: "",
    eventVenue: "",
    eventDescription: "",
    maxArtists: "",
    maxCustomers: "",
    priceCustomer: "",
    registrationFeeArtist: "",
    image: null,
    requestCrew: false,
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("eventTitle", form.eventTitle);
      data.append("eventDate", form.eventDate);
      data.append("eventTime", form.eventTime);
      data.append("eventVenue", form.eventVenue);
      data.append("eventDescription", form.eventDescription);
      data.append("maxArtists", Number(form.maxArtists));
      data.append("maxCustomers", Number(form.maxCustomers));
      data.append("priceCustomer", Number(form.priceCustomer));
      data.append("registrationFeeArtist", Number(form.registrationFeeArtist));
      data.append("requestCrew", form.requestCrew ? "true" : "false"); // boolean as string
      data.append("requestedBy", eventManagerId); // required by backend

      if (form.image) {
        data.append("image", form.image);
      }

      const res = await axios.post(`${URL}/create`, data);

      setEvents([...events, res.data.event]);

      // Reset form
      setForm({
        eventTitle: "",
        eventDate: "",
        eventTime: "",
        eventVenue: "",
        eventDescription: "",
        maxArtists: "",
        maxCustomers: "",
        priceCustomer: "",
        registrationFeeArtist: "",
        image: null,
        requestCrew: false,
      });

      document.querySelector('input[name="image"]').value = "";
    } catch (err) {
      console.error("Error creating event:", err.response?.data || err.message);
      alert("Failed to create event");
    }
  };

  return (
    <div>
      <h2>Organize New Event</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="eventTitle"
          placeholder="Title"
          value={form.eventTitle}
          onChange={handleChange}
          required
        />
        <input
          name="eventDate"
          type="date"
          value={form.eventDate}
          onChange={handleChange}
          required
        />
        <input
          name="eventTime"
          type="time"
          value={form.eventTime}
          onChange={handleChange}
          required
        />
        <input
          name="eventVenue"
          placeholder="Venue"
          value={form.eventVenue}
          onChange={handleChange}
          required
        />
        <textarea
          name="eventDescription"
          placeholder="Description"
          value={form.eventDescription}
          onChange={handleChange}
        />
        <input
          name="maxArtists"
          type="number"
          placeholder="Max Artists"
          value={form.maxArtists}
          onChange={handleChange}
          required
        />
        <input
          name="maxCustomers"
          type="number"
          placeholder="Max Customers"
          value={form.maxCustomers}
          onChange={handleChange}
          required
        />
        <input
          name="priceCustomer"
          type="number"
          placeholder="Price (Customer)"
          value={form.priceCustomer}
          onChange={handleChange}
          required
        />
        <input
          name="registrationFeeArtist"
          type="number"
          placeholder="Artist Fee"
          value={form.registrationFeeArtist}
          onChange={handleChange}
        />
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />

        <label>
          <input
            name="requestCrew"
            type="checkbox"
            checked={form.requestCrew}
            onChange={handleChange}
          />
          Request Crew
        </label>

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
}

export default OrganizeEventForm;
