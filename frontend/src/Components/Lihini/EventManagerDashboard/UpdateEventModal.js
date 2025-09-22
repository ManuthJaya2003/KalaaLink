import React, { useState, useEffect } from "react";
import axios from "axios";
import MapPicker from "../../Manuth/BookArtist/MapPicker";

function UpdateEventModal({ isOpen, onClose, eventData, onEventUpdated }) {
  const [inputs, setInputs] = useState({
    eventTitle: "",
    eventDescription: "",
    eventDate: "",
    eventTime: "",
    eventLocation: { lat: null, lng: null, address: "" },
    maxArtists: "",
    maxCustomers: "",
    priceCustomer: "",
    registrationFeeArtist: "",
    crewType: "",
    crewDetails: "",
    crewRequiredDate: "",
    crewRequiredTime: "",
    estimatedDuration: "",
    specialRequirements: ""
  });
  
  const [requestCrew, setRequestCrew] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Pre-fill form when eventData changes
  useEffect(() => {
    if (eventData && isOpen) {
      setInputs({
        eventTitle: eventData.eventTitle || "",
        eventDescription: eventData.eventDescription || "",
        eventDate: eventData.eventDate || "",
        eventTime: eventData.eventTime || "",
        eventLocation: {
          lat: eventData.eventLocation?.lat || null,
          lng: eventData.eventLocation?.lng || null,
          address: eventData.eventLocation?.address || ""
        },
        maxArtists: eventData.maxArtists || "",
        maxCustomers: eventData.maxCustomers || "",
        priceCustomer: eventData.priceCustomer || "",
        registrationFeeArtist: eventData.registrationFeeArtist || "",
        crewType: eventData.crewRequest?.crewType || "",
        crewDetails: eventData.crewRequest?.crewDetails || "",
        crewRequiredDate: eventData.crewRequest?.requiredDate || "",
        crewRequiredTime: eventData.crewRequest?.requiredTime || "",
        estimatedDuration: eventData.crewRequest?.estimatedDuration || "",
        specialRequirements: eventData.crewRequest?.specialRequirements || ""
      });
      
      setRequestCrew(eventData.crewRequest ? true : false);
      setImageFile(null);
      setSubmitMessage("");
    }
  }, [eventData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (location) => {
    setInputs(prev => ({
      ...prev,
      eventLocation: {
        ...prev.eventLocation,
        lat: location.lat,
        lng: location.lng,
        address: location.address || ""
      }
    }));
  };

  const handleAddressChange = (address) => {
    setInputs(prev => ({
      ...prev,
      eventLocation: {
        ...prev.eventLocation,
        address: address
      }
    }));
  };

  const handleRequestCrewChange = (e) => {
    setRequestCrew(e.target.checked);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const formData = new FormData();
      
      // Add all form fields
      Object.keys(inputs).forEach(key => {
        if (key !== 'eventLocation') {
          formData.append(key, inputs[key]);
        }
      });
      
      // Add location data
      formData.append('eventLocation', JSON.stringify(inputs.eventLocation));
      
      // Add image if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      // Add crew request data
      formData.append('requestCrew', requestCrew);

      const response = await axios.put(
        `http://localhost:5000/events/${eventData._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Handle crew request if needed
      if (requestCrew && (inputs.crewType || inputs.crewDetails)) {
        try {
          const crewRequestData = {
            eventId: eventData._id,
            requestedBy: "Event Manager",
            crewType: inputs.crewType,
            crewDetails: inputs.crewDetails,
            requiredDate: inputs.crewRequiredDate,
            requiredTime: inputs.crewRequiredTime,
            estimatedDuration: inputs.estimatedDuration,
            specialRequirements: inputs.specialRequirements
          };

          await axios.post("http://localhost:5000/api/crew-requests", crewRequestData);
        } catch (crewError) {
          console.error("Error creating crew request:", crewError);
        }
      }

      setSubmitMessage("Event updated successfully!");
      
      // Call the callback to refresh events
      if (onEventUpdated) {
        onEventUpdated();
      }
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Error updating event:", error);
      setSubmitMessage("Failed to update event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitMessage("");
    setImageFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Update Event</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
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

              {/* Submit Button - Inside Form */}
              <div className="form-actions-inline">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Event"}
                </button>
              </div>
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div className={`submit-message ${submitMessage.includes("successfully") ? "success" : "error"}`}>
                {submitMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateEventModal;
