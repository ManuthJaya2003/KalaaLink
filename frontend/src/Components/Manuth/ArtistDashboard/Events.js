import React, { useState, useEffect } from "react";
import axios from "axios";
import MainNav from "../../MainNav/MainNav";
import ArtistNav from "../ArtistNav/ArtistNav.js";
import AuthFooter from "../../Common/AuthFooter";
import "./Events.css";

const BACKEND_URL = "http://localhost:5000";

// Registration Confirmation Component
const RegistrationConfirmation = ({ event, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      const artist = JSON.parse(localStorage.getItem("artist"));
      if (!artist) {
        setError("Artist information not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Create Stripe checkout session for event registration
      const response = await axios.post(`${BACKEND_URL}/events/create-registration-checkout-session`, {
        eventId: event._id,
        artistId: artist.id,
        artistName: artist.stageName || `${artist.firstName} ${artist.lastName}`,
        artistEmail: artist.email,
      });

      if (response.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        setError("Failed to create checkout session");
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="checkout-form">
      <div className="form-header">
        <h3>Register for {event.eventTitle}</h3>
        <p className="registration-fee">
          Registration Fee: <span className="fee-amount">LKR {event.registrationFeeArtist}</span>
        </p>
        <p className="registration-description">
          You will be redirected to Stripe's secure checkout page to complete your payment.
          Stripe Link will be available for faster checkout if you've used it before.
        </p>
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
          type="button"
          className="btn-pay"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay LKR ${event.registrationFeeArtist}`}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

// Main Events Component
function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all available events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/events`);
      console.log("Events data:", response.data);
      // Backend returns events directly as an array, not wrapped in an object
      setEvents(Array.isArray(response.data) ? response.data : []);
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
      if (!artist) {
        console.log("No artist found in localStorage");
        return;
      }

      console.log("Fetching registrations for artist:", artist.id);
      const response = await axios.get(`${BACKEND_URL}/events/artist/${artist.id}/registrations`);
      console.log("Registered events response:", response.data);
      setRegisteredEvents(response.data.registrations || []);
    } catch (err) {
      console.error("Error fetching registered events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchRegisteredEvents();
    
    // Handle success/cancel redirects from Stripe
    const urlParams = new URLSearchParams(window.location.search);
    const registrationStatus = urlParams.get('registration');
    const eventName = urlParams.get('event');
    const sessionId = urlParams.get('session_id');
    
    if (registrationStatus === 'success') {
      setSuccessMessage(`Successfully registered for ${eventName || 'the event'}!`);
      console.log("Registration success detected, refreshing data...");
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // If we have a session ID, try to register the artist as a fallback
      if (sessionId) {
        handlePostPaymentRegistration(sessionId);
      } else {
        // Add a small delay to ensure backend processing is complete
        setTimeout(() => {
          console.log("Refreshing events and registrations after delay...");
          fetchEvents();
          fetchRegisteredEvents();
        }, 1000);
      }
    } else if (registrationStatus === 'cancelled') {
      setError('Registration was cancelled. You can try again anytime.');
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle post-payment registration as fallback
  const handlePostPaymentRegistration = async (sessionId) => {
    try {
      const artist = JSON.parse(localStorage.getItem("artist"));
      if (!artist) {
        console.error("Artist information not found");
        return;
      }

      console.log("Attempting fallback registration with session:", sessionId);

      // Get the session details to extract eventId
      const sessionResponse = await axios.get(`${BACKEND_URL}/events/session/${sessionId}`);
      const sessionData = sessionResponse.data;
      
      if (sessionData && sessionData.metadata && sessionData.metadata.eventId) {
        const eventId = sessionData.metadata.eventId;
        const artistId = artist.id;

        console.log("Attempting fallback registration for event:", eventId, "artist:", artistId);

        // Call the registration endpoint as fallback
        await axios.post(`${BACKEND_URL}/events/register-artist`, {
          eventId: eventId,
          artistId: artistId,
          sessionId: sessionId
        });

        console.log("Fallback registration successful");
      } else {
        console.log("No eventId found in session metadata, skipping fallback registration");
      }
    } catch (err) {
      console.error("Fallback registration failed:", err);
      // Don't show error to user as webhook might have already processed it
    } finally {
      // Always refresh the data
      setTimeout(() => {
        console.log("Refreshing events and registrations after fallback...");
        fetchEvents();
        fetchRegisteredEvents();
      }, 1000);
    }
  };

  const handleRegisterEvent = (event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const closeRegistrationModal = () => {
    setShowRegistrationModal(false);
    setSelectedEvent(null);
  };

  const isEventRegistered = (eventId) => {
    const isRegistered = registeredEvents.some(reg => reg.eventId === eventId);
    console.log(`Checking if event ${eventId} is registered:`, isRegistered, "Registered events:", registeredEvents);
    return isRegistered;
  };

  const isEventFull = (event) => {
    return event.registeredArtists && event.registeredArtists.length >= event.maxArtists;
  };

  const isEventPast = (event) => {
    return new Date(event.eventDate) < new Date();
  };

  if (loading) {
    return null;
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
      
      {/* Artist Navigation */}
      <ArtistNav />

      <div className="events-container">
        <h1 className="events-main-title">Available Events</h1>
        <p className="events-main-subtitle">Browse and register for upcoming events to perform at</p>

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
                      <span>Event Image</span>
                    </div>
                  )}
                </div>

                <div className="event-content">
                  <h3 className="event-title">{event.eventTitle}</h3>
                  
                  <div className="event-details">
                    <div className="event-info">
                      <span className="info-icon">Date:</span>
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                    </div>
                    <div className="event-info">
                      <span className="info-icon">Time:</span>
                      <span>{event.eventTime}</span>
                    </div>
                    <div className="event-info">
                      <span className="info-icon">Location:</span>
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
                    Registration Fee: <span className="fee-amount">LKR {event.registrationFeeArtist}</span>
                  </div>

                  <div className="event-actions">
                    {isRegistered ? (
                      <button className="btn-registered" disabled>
                        Registered
                      </button>
                    ) : isPast ? (
                      <button className="btn-past" disabled>
                        Event Passed
                      </button>
                    ) : isFull ? (
                      <button className="btn-full" disabled>
                        Event Full
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

      {/* Success Message */}
      {successMessage && (
        <div className="success-banner">
          <div className="success-content">
            <span className="success-icon">Success</span>
            <span className="success-text">{successMessage}</span>
            <button className="success-close" onClick={() => setSuccessMessage("")}>×</button>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div className="modal-overlay" onClick={closeRegistrationModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Event Registration</h3>
              <button className="modal-close" onClick={closeRegistrationModal}>×</button>
            </div>
            
            <RegistrationConfirmation
              event={selectedEvent}
              onClose={closeRegistrationModal}
            />
          </div>
        </div>
      )}
      </div>
      <AuthFooter />
    </div>
  );
}

export default Events;
