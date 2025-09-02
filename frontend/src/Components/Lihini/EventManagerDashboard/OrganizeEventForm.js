import React, { useState } from "react";
import axios from "axios";
import "./OrganizeEventForm.css";

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

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
    setIsSubmitting(true);
    setSubmitMessage("");

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
      data.append("requestCrew", form.requestCrew ? "true" : "false");
      data.append("requestedBy", eventManagerId);

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
      
      setSubmitMessage("Event created successfully! 🎉");
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (err) {
      console.error("Error creating event:", err.response?.data || err.message);
      setSubmitMessage("Failed to create event. Please try again.");
      setTimeout(() => setSubmitMessage(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="organize-event-container">
      <div className="form-header">
        <h2 className="form-title">🎭 Organize New Event</h2>
        <p className="form-subtitle">Create an amazing event that artists and customers will love</p>
      </div>

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-grid">
          {/* Event Title */}
          <div className="form-group full-width">
            <label className="form-label">
              <span className="label-icon">📝</span>
              Event Title
            </label>
            <input
              name="eventTitle"
              type="text"
              placeholder="Enter a captivating event title..."
              value={form.eventTitle}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📅</span>
              Event Date
            </label>
            <input
              name="eventDate"
              type="date"
              value={form.eventDate}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">⏰</span>
              Event Time
            </label>
            <input
              name="eventTime"
              type="time"
              value={form.eventTime}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {/* Venue */}
          <div className="form-group full-width">
            <label className="form-label">
              <span className="label-icon">📍</span>
              Venue
            </label>
            <input
              name="eventVenue"
              type="text"
              placeholder="Enter the event venue..."
              value={form.eventVenue}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label className="form-label">
              <span className="label-icon">📖</span>
              Event Description
            </label>
            <textarea
              name="eventDescription"
              placeholder="Describe your event in detail..."
              value={form.eventDescription}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
            />
          </div>

          {/* Capacity Fields */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🎨</span>
              Max Artists
            </label>
            <input
              name="maxArtists"
              type="number"
              placeholder="0"
              value={form.maxArtists}
              onChange={handleChange}
              className="form-input"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">👥</span>
              Max Customers
            </label>
            <input
              name="maxCustomers"
              type="number"
              placeholder="0"
              value={form.maxCustomers}
              onChange={handleChange}
              className="form-input"
              min="0"
              required
            />
          </div>

          {/* Pricing Fields */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">💰</span>
              Customer Price (Rs.)
            </label>
            <input
              name="priceCustomer"
              type="number"
              placeholder="0"
              value={form.priceCustomer}
              onChange={handleChange}
              className="form-input"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🎭</span>
              Artist Fee (Rs.)
            </label>
            <input
              name="registrationFeeArtist"
              type="number"
              placeholder="0"
              value={form.registrationFeeArtist}
              onChange={handleChange}
              className="form-input"
              min="0"
            />
          </div>

          {/* Image Upload */}
          <div className="form-group full-width">
            <label className="form-label">
              <span className="label-icon">🖼️</span>
              Event Image
            </label>
            <div className="file-upload-container">
              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="file-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="file-upload-label">
                <span className="upload-icon">📁</span>
                <span className="upload-text">
                  {form.image ? form.image.name : "Choose an image file..."}
                </span>
                <span className="upload-hint">Click to browse</span>
              </label>
            </div>
          </div>

          {/* Crew Request Checkbox */}
          <div className="form-group full-width">
            <div className="checkbox-container">
              <label className="checkbox-label">
                <input
                  name="requestCrew"
                  type="checkbox"
                  checked={form.requestCrew}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">
                  <span className="label-icon">👷</span>
                  Request Crew Support
                </span>
              </label>
              <p className="checkbox-hint">Check this if you need additional crew members for the event</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Creating Event...
              </>
            ) : (
              <>
                <span className="button-icon">✨</span>
                Create Event
              </>
            )}
          </button>
        </div>

        {/* Submit Message */}
        {submitMessage && (
          <div className={`submit-message ${submitMessage.includes('successfully') ? 'success' : 'error'}`}>
            {submitMessage}
          </div>
        )}
      </form>
    </div>
  );
}

export default OrganizeEventForm;
