import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import MapPicker from "../../Manuth/BookArtist/MapPicker";
import "./EventUpdate.css";

function EventUpdate() {
  const [inputs, setInputs] = useState({
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
    // Crew request fields
    crewType: "",
    crewDetails: "",
    crewRequiredDate: "",
    crewRequiredTime: "",
    estimatedDuration: "",
    specialRequirements: ""
  });
  const [imageFile, setImageFile] = useState(null); 
  const [requestCrew, setRequestCrew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
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
          eventLocation: eventData.venueCoordinates || { lat: "", lng: "" },
          eventDescription: eventData.eventDescription || "",
          priceCustomer: eventData.priceCustomer || "",
          registrationFeeArtist: eventData.registrationFeeArtist || "",
          maxArtists: eventData.maxArtists || "",
          maxCustomers: eventData.maxCustomers || "",
          // Crew request fields - populate if crew request exists
          crewType: eventData.crewRequest?.crewType || "",
          crewDetails: eventData.crewRequest?.crewDetails || "",
          crewRequiredDate: eventData.crewRequest?.requiredDate ? eventData.crewRequest.requiredDate.split("T")[0] : "",
          crewRequiredTime: eventData.crewRequest?.requiredTime || "",
          estimatedDuration: eventData.crewRequest?.estimatedDuration || "",
          specialRequirements: eventData.crewRequest?.specialRequirements || ""
        });

        setRequestCrew(!!eventData.crewRequest);
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

  // Handle location selection from MapPicker
  const handleLocationSelect = (location) => {
    setInputs(prev => ({ ...prev, eventLocation: location }));
  };

  // Handle address change from MapPicker
  const handleAddressChange = (address) => {
    setInputs(prev => ({ ...prev, eventVenue: address }));
  };

  const sendRequest = async () => {
    try {
      const formData = new FormData();
      
      // Add basic event fields
      formData.append("eventTitle", inputs.eventTitle);
      formData.append("eventDate", inputs.eventDate);
      formData.append("eventTime", inputs.eventTime);
      formData.append("eventVenue", inputs.eventVenue);
      formData.append("venueCoordinates", JSON.stringify(inputs.eventLocation));
      formData.append("eventDescription", inputs.eventDescription);
      formData.append("maxArtists", Number(inputs.maxArtists));
      formData.append("maxCustomers", Number(inputs.maxCustomers));
      formData.append("priceCustomer", Number(inputs.priceCustomer));
      formData.append("registrationFeeArtist", Number(inputs.registrationFeeArtist));
      formData.append("requestCrew", requestCrew ? "true" : "false");
      formData.append("requestedBy", localStorage.getItem('employee') ? JSON.parse(localStorage.getItem('employee')).name : "Event Manager");

      if (imageFile) formData.append("image", imageFile);

      const res = await axios.put(`http://localhost:5000/events/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // If crew is requested, create/update crew request
      if (requestCrew) {
        try {
          const crewRequestData = {
            eventId: id,
            requestedBy: localStorage.getItem('employee') ? JSON.parse(localStorage.getItem('employee')).name : "Event Manager",
            crewType: inputs.crewType,
            crewDetails: inputs.crewDetails,
            requiredDate: inputs.crewRequiredDate,
            requiredTime: inputs.crewRequiredTime,
            estimatedDuration: inputs.estimatedDuration,
            specialRequirements: inputs.specialRequirements
          };

          // Check if crew request already exists
          const existingCrewRequest = await axios.get(`http://localhost:5000/api/crew-requests/event/${id}`);
          
          if (existingCrewRequest.data.length > 0) {
            // Update existing crew request and reset status to pending
            const updateData = {
              ...crewRequestData,
              status: "pending", // Reset status to pending for admin review
              reviewedAt: null,
              reviewedBy: null,
              adminNotes: ""
            };
            const updatedCrewRequest = await axios.put(`http://localhost:5000/api/crew-requests/${existingCrewRequest.data[0]._id}`, updateData);
            
            // Update the event's crewRequest reference
            await axios.put(`http://localhost:5000/events/${id}`, {
              crewRequest: updatedCrewRequest.data.crewRequest._id
            });
          } else {
            // Create new crew request
            const newCrewRequest = await axios.post("http://localhost:5000/api/crew-requests", crewRequestData);
            
            // Update the event's crewRequest reference
            await axios.put(`http://localhost:5000/events/${id}`, {
              crewRequest: newCrewRequest.data.crewRequest._id
            });
          }
        } catch (crewError) {
          console.error("Error updating crew request:", crewError);
          // Don't fail the entire form if crew request fails
        }
      }

      return res.data;
    } catch (err) {
      console.error("Error updating event:", err.response || err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      await sendRequest();
      setSubmitMessage("Event updated successfully! 🎉");
      setTimeout(() => {
        setSubmitMessage("");
        navigate("/EventManagerDash");
      }, 2000);
    } catch (err) {
      console.error("Error updating event:", err.response?.data || err.message);
      setSubmitMessage("Failed to update event. Please try again.");
      setTimeout(() => setSubmitMessage(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="event-update-container">
      <h1 className="event-update-title">Update Event</h1>
      <p className="event-update-subtitle">Modify your event details and crew requirements</p>

      <form onSubmit={handleSubmit} className="event-update-form" encType="multipart/form-data">
        <div className="form-grid">
          {/* Event Title */}
          <div className="form-group full-width">
            <label className="form-label">
              Event Title
            </label>
            <input
              name="eventTitle"
              type="text"
              placeholder="Enter a captivating event title..."
              value={inputs.eventTitle}
              onChange={handleChange}
              className="form-input"
              required
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
                value={inputs.eventDate}
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
                value={inputs.eventTime}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Venue Location */}
          <div className="form-group full-width">
            <label className="form-label">
              Event Venue Location
            </label>
            <MapPicker
              selectedLocation={
                inputs.eventLocation.lat && inputs.eventLocation.lng
                  ? inputs.eventLocation
                  : null
              }
              onLocationSelect={handleLocationSelect}
              onAddressChange={handleAddressChange}
            />
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label className="form-label">
              Event Description
            </label>
            <textarea
              name="eventDescription"
              placeholder="Describe your event in detail..."
              value={inputs.eventDescription}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
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
                value={inputs.maxArtists}
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
                value={inputs.maxCustomers}
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
                value={inputs.priceCustomer}
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
                value={inputs.registrationFeeArtist}
                onChange={handleChange}
                className="form-input"
                min="0"
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
                onChange={handleImageChange}
                className="file-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="file-upload-label">
                <span className="upload-text">
                  {imageFile ? imageFile.name : "Choose a new image file..."}
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
                  type="checkbox"
                  checked={requestCrew}
                  onChange={handleRequestCrewChange}
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
          {requestCrew && (
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
                      value={inputs.crewType}
                      onChange={handleChange}
                      className="form-select"
                      required={requestCrew}
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
                      value={inputs.crewRequiredDate}
                      onChange={handleChange}
                      className="form-input"
                      required={requestCrew}
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
                      value={inputs.crewRequiredTime}
                      onChange={handleChange}
                      className="form-input"
                      required={requestCrew}
                    />
                  </div>

                  {/* Estimated Duration */}
                  <div className="form-group">
                    <label className="form-label">
                      Estimated Duration
                    </label>
                    <select
                      name="estimatedDuration"
                      value={inputs.estimatedDuration}
                      onChange={handleChange}
                      className="form-select"
                      required={requestCrew}
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
                      value={inputs.crewDetails}
                      onChange={handleChange}
                      className="form-textarea"
                      rows="4"
                      required={requestCrew}
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
                      value={inputs.specialRequirements}
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

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate("/EventManagerDash")}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating Event..." : "Update Event"}
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

export default EventUpdate;
