import React, { useState } from "react";
import axios from "axios";
import MapPicker from "../../Manuth/BookArtist/MapPicker";
import "./OrganizeEventForm.css";

const URL = "http://localhost:5000/events";

function OrganizeEventForm({ events, setEvents, eventManagerId }) {
  const [form, setForm] = useState({
    eventTitle: "",
    eventDate: "",
    eventTime: "",
    eventVenue: "",
    eventLocation: { lat: "", lng: "" },
    eventDescription: "",
    maxArtists: "",
    maxCustomers: "",
    priceCustomer: "",
    registrationFeeArtist: "",
    image: null,
    requestCrew: false,
    // Crew request fields
    crewType: "",
    crewDetails: "",
    crewRequiredDate: "",
    crewRequiredTime: "",
    estimatedDuration: "",
    specialRequirements: ""
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

  // Handle location selection from MapPicker
  const handleLocationSelect = (location) => {
    setForm({ ...form, eventLocation: location });
  };

  // Handle address change from MapPicker
  const handleAddressChange = (address) => {
    setForm({ ...form, eventVenue: address });
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
      data.append("venueCoordinates", JSON.stringify(form.eventLocation));
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

      // If crew is requested, create crew request
      if (form.requestCrew) {
        try {
          const crewRequestData = {
            eventId: res.data.event._id,
            requestedBy: eventManagerId || "Event Manager",
            crewType: form.crewType,
            crewDetails: form.crewDetails,
            requiredDate: form.crewRequiredDate,
            requiredTime: form.crewRequiredTime,
            estimatedDuration: form.estimatedDuration,
            specialRequirements: form.specialRequirements
          };

          await axios.post("http://localhost:5000/api/crew-requests", crewRequestData);
        } catch (crewError) {
          console.error("Error creating crew request:", crewError);
          // Don't fail the entire form if crew request fails
        }
      }

      setEvents([...events, res.data.event]);

      // Reset form
      setForm({
        eventTitle: "",
        eventDate: "",
        eventTime: "",
        eventVenue: "",
        eventLocation: { lat: "", lng: "" },
        eventDescription: "",
        maxArtists: "",
        maxCustomers: "",
        priceCustomer: "",
        registrationFeeArtist: "",
        image: null,
        requestCrew: false,
        // Reset crew request fields
        crewType: "",
        crewDetails: "",
        crewRequiredDate: "",
        crewRequiredTime: "",
        estimatedDuration: "",
        specialRequirements: ""
      });

      document.querySelector('input[name="image"]').value = "";
      
      setSubmitMessage("Event created successfully!");
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
      <div className="organize-event-header">
        <h1 className="organize-event-title">Organize New Event</h1>
        <button 
          type="submit" 
          form="organize-event-form"
          className={`submit-button header-button ${isSubmitting ? 'submitting' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Event..." : "Create Event"}
        </button>
      </div>
      <p className="organize-event-subtitle">Create an amazing event that artists and customers will love</p>

      <form id="organize-event-form" onSubmit={handleSubmit} className="event-form">
        <div className="form-grid">
          {/* Event Title - spans all three columns */}
          <div className="form-group title-field">
            <label className="form-label">
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

          {/* Event Description - spans all three columns, below Event Title */}
          <div className="form-group description-field">
            <label className="form-label">
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

          {/* Date and Time - 2-column grid */}
          <div className="date-time-container">
            <div className="form-group">
              <label className="form-label">
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
          </div>

          {/* Event Venue Location - spans all three columns */}
          <div className="form-group venue-field">
            <label className="form-label">
              Event Venue Location
            </label>
            <MapPicker
              selectedLocation={
                form.eventLocation.lat && form.eventLocation.lng
                  ? form.eventLocation
                  : null
              }
              onLocationSelect={handleLocationSelect}
              onAddressChange={handleAddressChange}
            />
          </div>

          {/* Four Fields - 4-column grid */}
          <div className="four-fields-container">
            <div className="form-group">
              <label className="form-label">
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

            <div className="form-group">
              <label className="form-label">
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
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group full-width">
            <label className="form-label">
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
                  Request Crew Support
                </span>
              </label>
              <p className="checkbox-hint">Check this if you need additional crew members for the event</p>
            </div>
          </div>

          {/* Crew Request Fields - Only show when checkbox is checked */}
          {form.requestCrew && (
            <div className="crew-request-section">
              <h3 className="crew-request-title">Crew Request Details</h3>
              <p className="crew-request-subtitle">Provide details about the crew support you need</p>

              <div className="form-grid">
                {/* Crew Four Fields - 4-column grid */}
                <div className="crew-four-fields-container">
                  {/* Crew Type */}
                  <div className="form-group">
                    <label className="form-label">
                      Crew Type
                    </label>
                    <select
                      name="crewType"
                      value={form.crewType}
                      onChange={handleChange}
                      className="form-select"
                      required={form.requestCrew}
                    >
                      <option value="">Select crew type...</option>
                      <option value="sound">Sound System</option>
                      <option value="lighting">Lighting</option>
                      <option value="stage_setup">Stage Setup</option>
                      <option value="security">Security</option>
                      <option value="catering">Catering</option>
                      <option value="photography">Photography</option>
                      <option value="transportation">Transportation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Required Date */}
                  <div className="form-group">
                    <label className="form-label">
                      Required Date
                    </label>
                    <input
                      name="crewRequiredDate"
                      type="date"
                      value={form.crewRequiredDate}
                      onChange={handleChange}
                      className="form-input"
                      required={form.requestCrew}
                    />
                  </div>

                  {/* Required Time */}
                  <div className="form-group">
                    <label className="form-label">
                      Required Time
                    </label>
                    <input
                      name="crewRequiredTime"
                      type="time"
                      value={form.crewRequiredTime}
                      onChange={handleChange}
                      className="form-input"
                      required={form.requestCrew}
                    />
                  </div>

                  {/* Estimated Duration */}
                  <div className="form-group">
                    <label className="form-label">
                      Estimated Duration
                    </label>
                    <select
                      name="estimatedDuration"
                      value={form.estimatedDuration}
                      onChange={handleChange}
                      className="form-select"
                      required={form.requestCrew}
                    >
                      <option value="">Select duration...</option>
                      <option value="1 hour">1 Hour</option>
                      <option value="2 hours">2 Hours</option>
                      <option value="4 hours">4 Hours</option>
                      <option value="6 hours">6 Hours</option>
                      <option value="8 hours">8 Hours</option>
                      <option value="Full day">Full Day</option>
                      <option value="Multiple days">Multiple Days</option>
                    </select>
                  </div>
                </div>

                {/* Crew Full-Width Fields */}
                <div className="crew-full-width-fields">
                  {/* Crew Details */}
                  <div className="form-group">
                    <label className="form-label">
                      Crew Details
                    </label>
                    <textarea
                      name="crewDetails"
                      placeholder="Describe the crew requirements in detail..."
                      value={form.crewDetails}
                      onChange={handleChange}
                      className="form-textarea"
                      rows="3"
                      required={form.requestCrew}
                    />
                  </div>

                  {/* Special Requirements */}
                  <div className="form-group">
                    <label className="form-label">
                      Special Requirements
                    </label>
                    <textarea
                      name="specialRequirements"
                      placeholder="Any special requirements or notes..."
                      value={form.specialRequirements}
                      onChange={handleChange}
                      className="form-textarea"
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button - Hidden but kept for functionality */}
        <div className="form-actions hidden-actions">
          <button 
            type="submit" 
            className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Event..." : "Create Event"}
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
