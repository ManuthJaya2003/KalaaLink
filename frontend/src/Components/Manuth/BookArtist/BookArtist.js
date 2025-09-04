import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import MapPicker from "./MapPicker";
import "./BookArtist.css";

// ✅ Backend URL matching your router
const BACKEND_URL = "http://localhost:5000/bookings";

function BookArtist() {
  const location = useLocation();
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
  const [bookingId, setBookingId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // ✅ Fetch artist info from backend
  useEffect(() => {
    if (!artistId) {
      console.error("No artistId provided in location.state");
      return;
    }

    const fetchArtist = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/artist/${artistId}`);
        if (!res.data.artist) {
          console.error("Artist not found in response:", res.data);
          showMessage("Artist not found!", "error");
          return;
        }
        setArtist(res.data.artist);
      } catch (err) {
        console.error("Failed to load artist info:", err.response || err);
        showMessage("Failed to load artist info!", "error");
      }
    };

    fetchArtist();
  }, [artistId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLocationSelect = (location) => {
    setFormData({ ...formData, eventLocation: location });
  };

  const handleAddressChange = (address) => {
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

  // ✅ Create booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!artist) return showMessage("Artist info not loaded yet", "error");
    if (!formData.eventLocation.lat || !formData.eventLocation.lng)
      return showMessage("Select venue location on the map", "error");
    if (!formData.eventVenue.trim())
      return showMessage("Provide a venue address", "error");
    if (!formData.customerEmail.trim())
      return showMessage("Provide a valid email", "error");

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

      const res = await axios.post(`${BACKEND_URL}/`, payload);

      if (!res.data.booking || !res.data.booking._id) {
        console.error("Booking response invalid:", res.data);
        showMessage("Booking creation failed", "error");
        return;
      }

      setBookingId(res.data.booking._id);
      setShowPayment(true);
      showMessage("Booking created! Proceed to payment.", "success");
    } catch (err) {
      console.error("Booking error:", err.response || err);
      showMessage(err.response?.data?.message || "Booking creation failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Pay now using Stripe Link
  const handlePayNow = async () => {
    if (!bookingId) return showMessage("Create booking first", "error");
    if (!formData.customerEmail.trim()) return showMessage("Email is required for payment", "error");

    setIsProcessing(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/${bookingId}/create-checkout-session`,
        {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
        }
      );

      if (!res.data || !res.data.url) {
        console.error("Payment session URL missing:", res.data);
        showMessage("Payment session creation failed", "error");
        return;
      }

      // Redirect to Stripe checkout
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Payment error:", err.response || err);
      const errorMessage = err.response?.data?.message || err.message || "Payment setup failed";
      showMessage(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!artist) return <p>Loading artist info...</p>;

  return (
    <div className="book-artist-container">
      <h2>Book {artist.name}</h2>
      <p>Price: ${artist.bookingPrice}</p>

      {!showPayment ? (
        <form onSubmit={handleBookingSubmit} className="book-artist-form">
          <input
            type="text"
            name="customerName"
            placeholder="Your Name"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="customerEmail"
            placeholder="Email"
            value={formData.customerEmail}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="customerPhoneNumber"
            placeholder="Phone Number"
            value={formData.customerPhoneNumber}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="eventType"
            placeholder="Event Type"
            value={formData.eventType}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
          />
          <input
            type="time"
            name="eventTime"
            value={formData.eventTime}
            onChange={handleChange}
            required
          />

          <MapPicker
            selectedLocation={
              formData.eventLocation.lat && formData.eventLocation.lng
                ? formData.eventLocation
                : null
            }
            onLocationSelect={handleLocationSelect}
            onAddressChange={handleAddressChange}
          />

          <button type="submit" disabled={isProcessing}>
            {isProcessing ? "Creating Booking..." : "Create Booking"}
          </button>
        </form>
      ) : (
        <div className="payment-section">
          <h3>Booking created! Ready to pay</h3>
          <p>
            Artist: {artist.name} | Event: {formData.eventType} | Price: ${artist.bookingPrice}
          </p>
          <button onClick={handlePayNow} disabled={isProcessing}>
            {isProcessing ? "Redirecting..." : "💳 Pay Now with Stripe"}
          </button>
        </div>
      )}

      {message && <div className={`message ${messageType}`}>{message}</div>}
    </div>
  );
}

export default BookArtist;
