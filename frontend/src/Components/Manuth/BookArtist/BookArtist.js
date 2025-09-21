import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import MapPicker from "./MapPicker";
import MainNav from "../../MainNav/MainNav";
import AuthFooter from "../../Common/AuthFooter";
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
        showMessage("Payment session creation failed. Please try again.", "error");
        return;
      }

      // Redirect to Stripe checkout
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Payment error:", err.response || err);
      console.error("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      const errorMessage = err.response?.data?.message || err.message || "Payment setup failed. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!artist) return (
    <div className="book-artist-page">
      <MainNav />
      <div className="book-artist-container">
        <p>Loading artist info...</p>
      </div>
      <AuthFooter />
    </div>
  );

  return (
    <div className="book-artist-page">
      <MainNav />
    <div className="book-artist-container">
      <div className="header-section">
        <h2>Book {artist.name}</h2>
        <div className="fancy-line"></div>
        <p>Price: LKR {artist.bookingPrice}</p>
      </div>

      {!showPayment ? (
        <form onSubmit={handleBookingSubmit} className="book-artist-form">
          <div className="form-group">
            <label htmlFor="customerName" className="form-label">Name</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              placeholder="Your Name"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="customerEmail" className="form-label">Email</label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              placeholder="Email"
              value={formData.customerEmail}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="customerPhoneNumber" className="form-label">Phone Number</label>
            <input
              type="text"
              id="customerPhoneNumber"
              name="customerPhoneNumber"
              placeholder="Phone Number"
              value={formData.customerPhoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventType" className="form-label">Event Type</label>
            <input
              type="text"
              id="eventType"
              name="eventType"
              placeholder="Event Type"
              value={formData.eventType}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventDate" className="form-label">Event Date</label>
            <input
              type="date"
              id="eventDate"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventTime" className="form-label">Event Time</label>
            <select
              id="eventTime"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleChange}
              required
              className="time-select"
            >
            <option value="">Select Time</option>
            <option value="00:00">12:00 AM</option>
            <option value="00:30">12:30 AM</option>
            <option value="01:00">1:00 AM</option>
            <option value="01:30">1:30 AM</option>
            <option value="02:00">2:00 AM</option>
            <option value="02:30">2:30 AM</option>
            <option value="03:00">3:00 AM</option>
            <option value="03:30">3:30 AM</option>
            <option value="04:00">4:00 AM</option>
            <option value="04:30">4:30 AM</option>
            <option value="05:00">5:00 AM</option>
            <option value="05:30">5:30 AM</option>
            <option value="06:00">6:00 AM</option>
            <option value="06:30">6:30 AM</option>
            <option value="07:00">7:00 AM</option>
            <option value="07:30">7:30 AM</option>
            <option value="08:00">8:00 AM</option>
            <option value="08:30">8:30 AM</option>
            <option value="09:00">9:00 AM</option>
            <option value="09:30">9:30 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="10:30">10:30 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="11:30">11:30 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="12:30">12:30 PM</option>
            <option value="13:00">1:00 PM</option>
            <option value="13:30">1:30 PM</option>
            <option value="14:00">2:00 PM</option>
            <option value="14:30">2:30 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="15:30">3:30 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="16:30">4:30 PM</option>
            <option value="17:00">5:00 PM</option>
            <option value="17:30">5:30 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="18:30">6:30 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="19:30">7:30 PM</option>
            <option value="20:00">8:00 PM</option>
            <option value="20:30">8:30 PM</option>
            <option value="21:00">9:00 PM</option>
            <option value="21:30">9:30 PM</option>
            <option value="22:00">10:00 PM</option>
            <option value="22:30">10:30 PM</option>
            <option value="23:00">11:00 PM</option>
            <option value="23:30">11:30 PM</option>
            </select>
          </div>

          <MapPicker
            selectedLocation={
              formData.eventLocation.lat && formData.eventLocation.lng
                ? formData.eventLocation
                : null
            }
            onLocationSelect={handleLocationSelect}
            onAddressChange={handleAddressChange}
          />

          <div className="button-container">
            <button type="submit" className="submit-btn" disabled={isProcessing}>
              {isProcessing ? "Creating Booking..." : "Create Booking"}
            </button>
          </div>
        </form>
      ) : (
        <div className="payment-section">
          <h3>Booking created! Ready to pay</h3>
          <p>
            Artist: {artist.name} | Event: {formData.eventType} | Price: LKR {artist.bookingPrice}
          </p>
          <button onClick={handlePayNow} className="pay-now-btn" disabled={isProcessing}>
            {isProcessing ? "Redirecting..." : "💳 Pay Now with Stripe"}
          </button>
        </div>
      )}

      {message && <div className={`message ${messageType}`}>{message}</div>}
      </div>
      <AuthFooter />
    </div>
  );
}

export default BookArtist;
