import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const BACKEND_URL = "http://localhost:5000";
const stripePromise = loadStripe(
  "pk_test_51S0seYQYjln4LvLSFGP8SdRgTWB4n8qbfx75KgLB5Uquv6kaAlpuMOyEouy92c4VaFlBT7cq9gOmLAVi44L7oUqf00tQzSJKGz"
);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      letterSpacing: "0.025em",
      fontFamily: "Source Code Pro, monospace",
      "::placeholder": {
        color: "#a0aec0",
      },
      padding: "12px",
    },
    invalid: {
      color: "#fa755a",
    },
  },
};

// Stripe Checkout Form
const CheckoutForm = ({ bookingId, amount, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paymentRes = await axios.post(`${BACKEND_URL}/bookings/create-payment-intent`, {
        bookingId,
        amount,
      });
      const clientSecret = paymentRes.data.clientSecret;

      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardNumberElement) },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
      } else if (paymentIntent.status === "succeeded") {
        await axios.post(`${BACKEND_URL}/bookings/confirm`, { bookingId });
        onPaymentSuccess();
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "15px" }}>
        <label>Card Number</label>
        <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <div style={{ flex: 1 }}>
          <label>Expiry</label>
          <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <div style={{ flex: 1 }}>
          <label>CVC</label>
          <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#6772e5",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        {loading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </form>
  );
};

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
  const [bookingId, setBookingId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

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
    if (name === "lat" || name === "lng") {
      setFormData({ ...formData, eventLocation: { ...formData.eventLocation, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!artist) {
      alert("Artist info not loaded yet");
      return;
    }

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
        eventVenue: formData.eventVenue,
        eventLocation: {
          lat: parseFloat(formData.eventLocation.lat) || null,
          lng: parseFloat(formData.eventLocation.lng) || null,
        },
      };

      const res = await axios.post(`${BACKEND_URL}/bookings/`, payload);
      setBookingId(res.data.booking._id);
      setShowPayment(true);
    } catch (err) {
      console.error(err);
      alert("Booking creation failed!");
    }
  };

  const handlePaymentSuccess = () => {
    alert("Booking Confirmed ✅");
    navigate("/");
  };

  if (!artist) return <p>Loading artist info...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Book {artist.name}</h2>
      <p>Booking Price: ${artist.bookingPrice}</p>

      {!showPayment ? (
        <form onSubmit={handleBookingSubmit}>
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
            placeholder="Your Email"
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
          <input
            type="text"
            name="eventVenue"
            placeholder="Event Venue"
            value={formData.eventVenue}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lat"
            placeholder="Latitude (optional)"
            value={formData.eventLocation.lat}
            onChange={handleChange}
          />
          <input
            type="text"
            name="lng"
            placeholder="Longitude (optional)"
            value={formData.eventLocation.lng}
            onChange={handleChange}
          />
          <button type="submit">Proceed to Payment</button>
        </form>
      ) : (
        <Elements stripe={stripePromise}>
          <CheckoutForm
            bookingId={bookingId}
            amount={artist.bookingPrice * 100}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </Elements>
      )}
    </div>
  );
}

export default BookArtist;
