import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import MapPicker from "./MapPicker";
import "./BookArtist.css";

const BACKEND_URL = "http://localhost:5000";

function BookArtist() {
  const location = useLocation();
  const navigate = useNavigate();
  const { artistId } = location.state || {};

  const [artist, setArtist] = useState(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhoneNumber: "",
    eventType: "",
    eventDate: "",
    eventTime: "",
    eventVenue: "",
    eventLocation: { lat: "", lng: "" },
  });
  const [venueAddress, setVenueAddress] = useState("");
  const [bookingId, setBookingId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Fetch artist info directly
  useEffect(() => {
    if (!artistId) return;

    axios
      .get(`${BACKEND_URL}/bookings/artist/${artistId}`)
      .then((res) => setArtist(res.data.artist))
      .catch((err) => {
        console.error(err);
        alert("Failed to load artist info!");
      });
  }, [artistId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLocationSelect = (location) => {
    setFormData({ ...formData, eventLocation: location });
  };

  const handleAddressChange = (address) => {
    setVenueAddress(address);
    setFormData({ ...formData, eventVenue: address });
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!artist) {
      alert("Artist info not loaded yet");
      return;
    }

    // Validate that location is selected
    if (!formData.eventLocation.lat || !formData.eventLocation.lng) {
      alert("Please select a venue location on the map");
      return;
    }

    // Validate that venue address is provided
    if (!formData.eventVenue || formData.eventVenue.trim() === "") {
      alert("Please provide a venue address or select a location on the map");
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        artistId,
        artistModel: artist.artistType,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhoneNumber: formData.customerPhoneNumber,
        eventType: formData.eventType,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        eventVenue: formData.eventVenue.trim(),
        eventLocation: {
          lat: parseFloat(formData.eventLocation.lat),
          lng: parseFloat(formData.eventLocation.lng),
        },
      };

      console.log("Submitting booking with payload:", payload);

      const res = await axios.post(`${BACKEND_URL}/bookings/`, payload);
      setBookingId(res.data.booking._id);
      setShowPayment(true);
      showMessage("Booking created successfully! You can now proceed to payment.", "success");
    } catch (err) {
      console.error("Booking error:", err);
      if (err.response?.data?.error) {
        showMessage(`Booking failed: ${err.response.data.error}`, "error");
      } else {
        showMessage("Booking creation failed! Please try again.", "error");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayNow = async () => {
    if (!bookingId) {
      showMessage("Please create your booking first", "error");
      return;
    }

    setIsProcessing(true);
    try {
      console.log("Creating Stripe checkout session for artist booking:", bookingId);

      // Create Stripe checkout session (Stripe Link)
      const res = await axios.post(`${BACKEND_URL}/bookings/${bookingId}/create-checkout-session`, {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
      });

      if (res.data.url) {
        console.log("Stripe checkout session created successfully, redirecting to:", res.data.url);
        // Redirect to Stripe Checkout (Stripe Link - green gateway)
        window.location.href = res.data.url;
      } else {
        console.error("Failed to create checkout session:", res.data);
        showMessage(res.data.message || "Failed to create payment session", "error");
      }
    } catch (err) {
      console.error("Payment setup error:", err);
      showMessage("Payment setup failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!artist) return <p>Loading artist info...</p>;

  return (
    <div className="book-artist-container">
      <h2>Book {artist.name}</h2>
      <p>Booking Price: ${artist.bookingPrice}</p>

      {!showPayment ? (
        <form className="book-artist-form" onSubmit={handleBookingSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                name="customerName"
                placeholder="Enter your full name"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="customerEmail"
                placeholder="Enter your email"
                value={formData.customerEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="customerPhoneNumber"
              placeholder="Enter your phone number"
              value={formData.customerPhoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Event Type</label>
              <input
                type="text"
                name="eventType"
                placeholder="e.g., Wedding, Birthday, Corporate Event"
                value={formData.eventType}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Event Date</label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Event Time</label>
            <input
              type="time"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Venue Location Section */}
          <div className="venue-location-section">
            <h3>📍 Venue Location</h3>
            <p>Select the venue location where the artist will perform</p>
            
            <MapPicker
              selectedLocation={formData.eventLocation.lat && formData.eventLocation.lng ? formData.eventLocation : null}
              onLocationSelect={handleLocationSelect}
              onAddressChange={handleAddressChange}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isProcessing}>
            {isProcessing ? "Creating Booking..." : "Create Booking"}
          </button>
        </form>
      ) : (
        <div className="payment-section">
          <div className="booking-success">
            <h3>✅ Booking Created Successfully!</h3>
            <p>Your booking has been created and is now ready for payment.</p>
            
            <div className="booking-details">
              <h4>Booking Summary:</h4>
              <p><strong>Artist:</strong> {artist.name}</p>
              <p><strong>Event Type:</strong> {formData.eventType}</p>
              <p><strong>Date:</strong> {new Date(formData.eventDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {formData.eventTime}</p>
              <p><strong>Venue:</strong> {formData.eventVenue}</p>
              <p><strong>Total Amount:</strong> ${artist.bookingPrice}</p>
            </div>

            <button 
              onClick={handlePayNow} 
              className="pay-now-btn"
              disabled={isProcessing}
            >
              {isProcessing ? "Setting up payment..." : "💳 Pay Now with Stripe"}
            </button>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default BookArtist;
