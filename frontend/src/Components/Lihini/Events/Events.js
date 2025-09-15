import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import MainNav from "../../MainNav/MainNav";
import Event from "../Event/Event";
import TestimonialModal from "./TestimonialModal";
import EventTestimonials from "./EventTestimonials";
import "../Event/Event.css";

// Load Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_your_publishable_key");

// Debug: Log the Stripe key being used
console.log("Stripe key:", process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ? "Found" : "Not found");
console.log("Using key:", process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_your_publishable_key");

function Events({ events: propEvents }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [testimonials, setTestimonials] = useState([]);

  // Fetch events from backend API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Attempting to fetch events from backend...");
      const response = await axios.get("http://localhost:5000/events", {
        timeout: 10000, // 10 second timeout
      });
      
      // Handle response format - backend now returns array directly
      let eventsData = Array.isArray(response.data) ? response.data : [];
      
      setEvents(eventsData);
      console.log("Events fetched successfully:", eventsData);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      
      if (err.code === 'ECONNABORTED') {
        setError("Request timeout. Please check if the backend server is running.");
      } else if (err.response) {
        setError(`Server error: ${err.response.status}. Please try again later.`);
      } else if (err.request) {
        setError("Cannot connect to server. Please check if the backend is running on localhost:5000.");
      } else {
        setError("Failed to load events. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch events on component mount
  useEffect(() => {
    console.log("Events component mounted, fetching events...");
    fetchEvents();
  }, []);

  // Update events if propEvents change (for real-time updates)
  useEffect(() => {
    console.log("propEvents changed:", propEvents);
    if (propEvents && Array.isArray(propEvents) && propEvents.length > 0) {
      setEvents(propEvents);
    }
  }, [propEvents]);

  const handleBookNow = (event) => {
    setSelectedEvent(event);
    setShowBookingModal(true);
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const closeModals = () => {
    setShowBookingModal(false);
    setShowDetailsModal(false);
    setShowTestimonialModal(false);
    setSelectedEvent(null);
  };

  const handleTestimonialSubmitted = (newTestimonial) => {
    // Add the new testimonial to the local state
    setTestimonials(prev => [newTestimonial, ...prev]);
  };


  // Loading state
  if (loading) {
    return (
      <div>
        <MainNav />
        <div className="events-container">
          <div className="events-header">
            <h1 className="events-title">Our Events</h1>
            <p className="events-subtitle">
              Discover amazing events and book your tickets today
            </p>
          </div>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <MainNav />
        <div className="events-container">
          <div className="events-header">
            <h1 className="events-title">Our Events</h1>
            <p className="events-subtitle">
              Discover amazing events and book your tickets today
            </p>
          </div>
          <div className="error-state">
            <p className="error-text">{error}</p>
            <button className="retry-button" onClick={fetchEvents}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MainNav />
      <div className="events-container">
        <div className="events-header">
          <h1 className="events-title">Our Events</h1>
          <p className="events-subtitle">
            Discover amazing events and book your tickets today
          </p>
          <button className="refresh-button" onClick={fetchEvents} disabled={loading}>
            {loading ? "Refreshing..." : "🔄 Refresh Events"}
          </button>
        </div>
        
        {Array.isArray(events) && events.length > 0 ? (
          <div className="events-grid">
            {events.map((event, i) => (
              <Event 
                key={i} 
                event={event} 
                onBookNow={() => handleBookNow(event)}
                onViewDetails={() => handleViewDetails(event)}
              />
            ))}
          </div>
        ) : (
          <div className="no-events">
            <p className="no-events-text">No events available at the moment</p>
            <p className="no-events-subtext">Check back later for upcoming events!</p>
          </div>
        )}

        {/* Enhanced Booking Modal */}
        {showBookingModal && selectedEvent && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Book Event</h3>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="modal-body">
                <EnhancedBookingForm 
                  event={selectedEvent} 
                  onClose={closeModals}
                />
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedEvent && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{selectedEvent.eventTitle}</h3>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="modal-body">
                {selectedEvent.image && (
                  <img 
                    src={`http://localhost:5000${selectedEvent.image.startsWith("/uploads") ? selectedEvent.image : `/uploads/${selectedEvent.image}`}`} 
                    alt={selectedEvent.eventTitle} 
                    className="modal-image" 
                  />
                )}
                <div className="modal-details">
                  <div className="detail-item">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{new Date(selectedEvent.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time</span>
                    <span className="detail-value">{selectedEvent.eventTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Venue</span>
                    <span className="detail-value">{selectedEvent.eventVenue}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Description</span>
                    <span className="detail-value">{selectedEvent.description || "No description available"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price</span>
                    <span className="detail-value price">Rs.{selectedEvent.priceCustomer}</span>
                  </div>
                </div>
                <EnhancedBookingForm 
                  event={selectedEvent} 
                  onClose={closeModals}
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Testimonials Section */}
        <div className="testimonials-section">
          <div className="testimonials-header">
            <h2 className="testimonials-title">What Our Attendees Say</h2>
            <p className="testimonials-subtitle">Hear from people who have attended our amazing events</p>
            <button
              className="testimonials-button"
              onClick={() => setShowTestimonialModal(true)}
            >
              Leave a Testimonial
            </button>
          </div>
          <div className="testimonials-grid">
            <EventTestimonials eventId={null} />
          </div>
        </div>

      </div>
      
      
      {/* Render TestimonialModal using portal to ensure it's at root level */}
      {showTestimonialModal && createPortal(
        <TestimonialModal
          isOpen={showTestimonialModal}
          onClose={() => setShowTestimonialModal(false)}
          eventId={selectedEvent?._id}
          onTestimonialSubmitted={handleTestimonialSubmitted}
        />,
        document.body
      )}
    </div>
  );
}

// Enhanced Booking Form with Stripe Integration
function EnhancedBookingForm({ event, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setTickets(1);
    setMessage("");
    setMessageType("");
    setCurrentBooking(null);
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      showMessage("Please fill in all required fields", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("http://localhost:5000/eventBookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event._id,
          customerName: name.trim(),
          customerEmail: email.trim(),
          ticketsBooked: Number(tickets),
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.booking) {
        setCurrentBooking(data.booking);
        showMessage("Booking reserved successfully! You can now proceed to payment.", "success");
      } else {
        showMessage(data.message || "Booking failed", "error");
      }
    } catch (err) {
      showMessage("Network error. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayNow = async () => {
    if (!currentBooking) {
      showMessage("Please reserve your booking first", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      console.log("Creating Stripe checkout session for existing booking:", currentBooking._id);

      // Create Stripe checkout session using the EXISTING booking ID
      const res = await fetch(`http://localhost:5000/eventBookings/${currentBooking._id}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: name.trim() || currentBooking.customerName,
          customerEmail: email.trim() || currentBooking.customerEmail,
          ticketsBooked: Number(tickets) || currentBooking.ticketsBooked,
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.url) {
        console.log("Stripe checkout session created successfully, redirecting to:", data.url);
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        console.error("Failed to create checkout session:", data);
        showMessage(data.message || "Failed to create payment session", "error");
      }
    } catch (err) {
      console.error("Payment setup error:", err);
      showMessage("Payment setup failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = event.priceCustomer * tickets;

  return (
    <div className="enhanced-booking-form">
      <div className="booking-summary">
        <h4>Booking Summary</h4>
        <div className="summary-item">
          <span>Event:</span>
          <span>{event.eventTitle}</span>
        </div>
        <div className="summary-item">
          <span>Price per ticket:</span>
          <span>Rs. {event.priceCustomer}</span>
        </div>
        <div className="summary-item">
          <span>Total amount:</span>
          <span className="total-amount">Rs. {totalAmount}</span>
        </div>
        {currentBooking && (
          <div className="summary-item">
            <span>Booking ID:</span>
            <span>{currentBooking._id}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleReserve} className="modal-form">
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="input-field" 
            required
            disabled={isProcessing || currentBooking}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="input-field" 
            required
            disabled={isProcessing || currentBooking}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Number of Tickets</label>
          <input 
            type="number" 
            min={1} 
            max={10}
            value={tickets} 
            onChange={(e) => setTickets(Math.max(1, parseInt(e.target.value) || 1))} 
            className="input-field" 
            disabled={isProcessing || currentBooking}
          />
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="form-actions">
          {!currentBooking ? (
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Reserve Now"}
            </button>
          ) : (
            <div className="payment-actions">
              <button 
                type="button" 
                onClick={handlePayNow} 
                className="btn btn-success"
                disabled={isProcessing}
              >
                {isProcessing ? "Setting up payment..." : "Pay Now"}
              </button>
              <button 
                type="button" 
                onClick={resetForm} 
                className="btn btn-secondary"
                disabled={isProcessing}
              >
                New Booking
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default Events;
