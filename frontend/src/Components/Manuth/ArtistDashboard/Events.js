import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import MainNav from "../../MainNav/MainNav";
import ArtistNav from "../ArtistNav/ArtistNav.js";
import "./Events.css";

// Stripe configuration
const stripePromise = loadStripe(
  "pk_test_51S0seYQYjln4LvLSFGP8SdRgTWB4n8qbfx75KgLB5Uquv6kaAlpuMOyEouy92c4VaFlBT7cq9gOmLAVi44L7oUqf00tQzSJKGz"
);

const BACKEND_URL = "http://localhost:5000";

// Stripe Checkout Form Component
const CheckoutForm = ({ event, onPaymentSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create payment intent for event registration
      const paymentRes = await axios.post(`${BACKEND_URL}/events/create-registration-payment`, {
        eventId: event._id,
        artistId: JSON.parse(localStorage.getItem("artist")).id,
        amount: event.registrationFeeArtist * 100, // Convert to cents
      });

      const clientSecret = paymentRes.data.clientSecret;

      // Confirm card payment
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
      } else if (paymentIntent.status === "succeeded") {
        // Register artist for the event
        await axios.post(`${BACKEND_URL}/events/register-artist`, {
          eventId: event._id,
          artistId: JSON.parse(localStorage.getItem("artist")).id,
          paymentIntentId: paymentIntent.id,
        });

        setSuccess(true);
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment failed");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="payment-success">
        <div className="success-icon">✅</div>
        <h3>Registration Successful!</h3>
        <p>You have been registered for {event.eventTitle}</p>
        <p>Check your email for confirmation details.</p>
      </div>
    );
  }

  return (
    <div className="checkout-form">
      <div className="form-header">
        <h3>Register for {event.eventTitle}</h3>
        <p className="registration-fee">
          Registration Fee: <span className="fee-amount">${event.registrationFeeArtist}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card-element-container">
          <label>Card Details</label>
          <CardElement
            options={{
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
            }}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-pay"
            disabled={!stripe || loading}
          >
            {loading ? "Processing..." : `Pay $${event.registrationFeeArtist}`}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

// Main Events Component
function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  // Fetch all available events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/events`);
      console.log("Events data:", response.data.events);
      setEvents(response.data.events || []);
    } catch (err) {
      setError("Failed to fetch events");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch artist's registered events
  const fetchRegisteredEvents = async () => {
    try {
      const artist = JSON.parse(localStorage.getItem("artist"));
      if (!artist) return;

      const response = await axios.get(`${BACKEND_URL}/events/artist/${artist.id}/registrations`);
      setRegisteredEvents(response.data.registrations || []);
    } catch (err) {
      console.error("Error fetching registered events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchRegisteredEvents();
  }, []);

  const handleRegisterEvent = (event) => {
    setSelectedEvent(event);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    fetchRegisteredEvents(); // Refresh registered events
    setShowPaymentModal(false);
    setSelectedEvent(null);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedEvent(null);
  };

  const isEventRegistered = (eventId) => {
    return registeredEvents.some(reg => reg.eventId === eventId);
  };

  const isEventFull = (event) => {
    return event.registeredArtists && event.registeredArtists.length >= event.maxArtists;
  };

  const isEventPast = (event) => {
    return new Date(event.eventDate) < new Date();
  };

  if (loading) {
    return (
      <div className="events-page">
        <MainNav />
        <div className="events-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-page">
        <MainNav />
        <div className="events-container">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={fetchEvents} className="btn-retry">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <MainNav />
      
      {/* Events Header */}
      <header className="events-header-main">
        <div className="events-header-container">
          <h1 className="events-header-title">
            <span className="events-header-icon">🎵</span>
            Available Events
          </h1>
          <p className="events-header-subtitle">Browse and register for upcoming events to perform at</p>
        </div>
      </header>

      {/* Artist Navigation */}
      <ArtistNav />

      <div className="events-container">

      <div className="events-grid">
        {events.length === 0 ? (
          <div className="no-events">
            <p>No events available at the moment.</p>
            <p>Check back later for new opportunities!</p>
          </div>
        ) : (
          events.map((event) => {
            const isRegistered = isEventRegistered(event._id);
            const isFull = isEventFull(event);
            const isPast = isEventPast(event);

            return (
              <div key={event._id} className={`event-card ${isRegistered ? 'registered' : ''} ${isPast ? 'past' : ''}`}>
                <div className="event-image">
                  {event.image ? (
                    <img src={`${BACKEND_URL}${event.image}`} alt={event.eventTitle} />
                  ) : (
                    <div className="event-placeholder">
                      <span>🎵</span>
                    </div>
                  )}
                </div>

                <div className="event-content">
                  <h3 className="event-title">{event.eventTitle}</h3>
                  
                  <div className="event-details">
                    <div className="event-info">
                      <span className="info-icon">📅</span>
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                    </div>
                    <div className="event-info">
                      <span className="info-icon">🕒</span>
                      <span>{event.eventTime}</span>
                    </div>
                    <div className="event-info">
                      <span className="info-icon">📍</span>
                      <span>{event.eventVenue}</span>
                    </div>
                  </div>

                  {event.eventDescription && (
                    <p className="event-description">{event.eventDescription}</p>
                  )}

                  <div className="event-stats">
                    <div className="stat">
                      <span className="stat-label">Artists:</span>
                      <span className="stat-value">
                        {event.registeredArtists ? event.registeredArtists.length : 0}/{event.maxArtists}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Customers:</span>
                      <span className="stat-value">
                        {event.registeredCustomers ? event.registeredCustomers.length : 0}/{event.maxCustomers}
                      </span>
                    </div>
                  </div>

                  <div className="registration-fee">
                    Registration Fee: <span className="fee-amount">${event.registrationFeeArtist}</span>
                  </div>

                  <div className="event-actions">
                    {isRegistered ? (
                      <button className="btn-registered" disabled>
                        ✅ Registered
                      </button>
                    ) : isPast ? (
                      <button className="btn-past" disabled>
                        ⏰ Event Passed
                      </button>
                    ) : isFull ? (
                      <button className="btn-full" disabled>
                        🚫 Event Full
                      </button>
                    ) : (
                      <button
                        className="btn-register"
                        onClick={() => handleRegisterEvent(event)}
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedEvent && (
        <div className="modal-overlay" onClick={closePaymentModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Event Registration</h3>
              <button className="modal-close" onClick={closePaymentModal}>×</button>
            </div>
            
            <Elements stripe={stripePromise}>
              <CheckoutForm
                event={selectedEvent}
                onPaymentSuccess={handlePaymentSuccess}
                onClose={closePaymentModal}
              />
            </Elements>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Events;
