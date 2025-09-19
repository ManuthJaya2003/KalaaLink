import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import MainNav from "../../MainNav/MainNav";
import MainFooter from "../../MainFooter/MainFooter";
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
  
  // Testimonials navigation
  const testimonialsRef = useRef(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDate, setSelectedDate] = useState("Any Date");
  const [selectedLocation, setSelectedLocation] = useState("Any Location");
  const [filteredEvents, setFilteredEvents] = useState([]);

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

  // Filter events based on search and filter criteria
  useEffect(() => {
    if (!Array.isArray(events) || events.length === 0) {
      setFilteredEvents([]);
      return;
    }

    let filtered = [...events];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.eventTitle?.toLowerCase().includes(searchLower) ||
        event.eventDescription?.toLowerCase().includes(searchLower) ||
        event.eventVenue?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter (using eventTitle as category for now)
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(event => {
        if (!event.eventTitle) return false;
        const eventTitleWords = event.eventTitle.split(' ');
        const firstWord = eventTitleWords[0]?.replace(/[^\w\s]/g, '').trim().toLowerCase();
        return firstWord === selectedCategory.toLowerCase();
      });
    }

    // Date filter
    if (selectedDate !== "Any Date") {
      const selectedDateObj = new Date(selectedDate);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate.toDateString() === selectedDateObj.toDateString();
      });
    }

    // Location filter
    if (selectedLocation !== "Any Location") {
      filtered = filtered.filter(event => 
        event.eventVenue?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedCategory, selectedDate, selectedLocation]);

  // Get unique categories from events (using eventTitle as category)
  const getUniqueCategories = () => {
    const categories = new Set();
    events.forEach(event => {
      if (event.eventTitle) {
        // Extract category from event title (first word or main category)
        const words = event.eventTitle.split(' ');
        if (words.length > 0) {
          // Clean up the category name
          const category = words[0].replace(/[^\w\s]/g, '').trim();
          if (category.length > 0) {
            categories.add(category);
          }
        }
      }
    });
    return Array.from(categories).sort();
  };

  // Get unique locations from events
  const getUniqueLocations = () => {
    const locations = new Set();
    events.forEach(event => {
      if (event.eventVenue) {
        locations.add(event.eventVenue);
      }
    });
    return Array.from(locations).sort();
  };

  // Get unique dates from events
  const getUniqueDates = () => {
    const dates = new Set();
    events.forEach(event => {
      if (event.eventDate) {
        const date = new Date(event.eventDate);
        dates.add(date.toISOString().split('T')[0]);
      }
    });
    return Array.from(dates).sort();
  };


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

  // Testimonials scroll function
  const scrollTestimonials = (direction) => {
    const slider = testimonialsRef.current;
    if (!slider) return;
    
    const cardWidth = 350; // Width of each testimonial card
    const gap = 30; // Gap between cards
    const scrollAmount = cardWidth + gap;
    
    if (direction === 'next') {
      setCurrentTestimonial(prev => prev + 1);
      slider.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    } else {
      setCurrentTestimonial(prev => Math.max(prev - 1, 0));
      slider.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Autoplay testimonials
  useEffect(() => {
    const autoplayInterval = setInterval(() => {
      const slider = testimonialsRef.current;
      if (slider) {
        const cardWidth = 350;
        const gap = 30;
        const scrollAmount = cardWidth + gap;
        slider.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
        setCurrentTestimonial(prev => prev + 1);
      }
    }, 5000); // Auto-scroll every 5 seconds

    return () => clearInterval(autoplayInterval);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div>
        <MainNav />
        {/* Hero Video Section */}
        <div className="events-hero-video">
          <video
            className="events-background-video"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/eventHeroBar.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="events-container">
          <div className="events-text-section">
            <h2 className="events-title">Our Events</h2>
            <p className="events-subtitle">Discover extraordinary events and book your tickets today</p>
            <button className="refresh-button" onClick={fetchEvents} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh Events"}
            </button>
          </div>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading events...</p>
          </div>
        </div>
        
        <MainFooter />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <MainNav />
        {/* Hero Video Section */}
        <div className="events-hero-video">
          <video
            className="events-background-video"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/eventHeroBar.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="events-container">
          <div className="events-text-section">
            <h2 className="events-title">Our Events</h2>
            <p className="events-subtitle">Discover extraordinary events and book your tickets today</p>
            <button className="refresh-button" onClick={fetchEvents} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh Events"}
            </button>
          </div>
          <div className="error-state">
            <p className="error-text">{error}</p>
            <button className="retry-button" onClick={fetchEvents}>
              Try Again
            </button>
          </div>
        </div>
        
        <MainFooter />
      </div>
    );
  }

  return (
    <div>
      <MainNav />
      {/* Hero Video Section */}
      <div className="events-hero-video">
        <video
          className="events-background-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/eventHeroBar.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="events-container">
        <div className="events-text-section">
          <h2 className="events-title">Our Events</h2>
          <p className="events-subtitle">Discover extraordinary events and book your tickets today</p>
        </div>

        {/* Search and Filter Bar */}
        {Array.isArray(events) && events.length > 0 && (
          <div className="search-filter-bar">
            <div className="search-filter-left">
              <div className="search-group">
                <input
                  type="text"
                  placeholder="Search events..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="search-button" onClick={() => {}}>
                  Search
                </button>
              </div>
            </div>

            <div className="search-filter-right">
              <div className="filter-group">
                <select
                  id="category-filter"
                  className="filter-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All Categories">All Categories</option>
                  {getUniqueCategories().map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select
                  id="date-filter"
                  className="filter-select"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  <option value="Any Date">Any Date</option>
                  {getUniqueDates().map((date, index) => (
                    <option key={index} value={date}>
                      {new Date(date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select
                  id="location-filter"
                  className="filter-select"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="Any Location">Any Location</option>
                  {getUniqueLocations().map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="clear-btn"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All Categories");
                  setSelectedDate("Any Date");
                  setSelectedLocation("Any Location");
                }}
                disabled={!searchTerm && selectedCategory === "All Categories" && selectedDate === "Any Date" && selectedLocation === "Any Location"}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
        
        {Array.isArray(events) && events.length > 0 ? (
          filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map((event, i) => (
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
              <p className="no-events-text">No events found matching your criteria</p>
              <p className="no-events-subtext">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All Categories");
                  setSelectedDate("Any Date");
                  setSelectedLocation("Any Location");
                }}
                className="retry-button"
              >
                Clear Filters
              </button>
            </div>
          )
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
            <div className="modal-content event-details-modal" onClick={(e) => e.stopPropagation()}>
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
                <div className="event-info-layout">
                  <div className="info-row">
                    <span className="info-label">Date</span>
                    <span className="info-value">{new Date(selectedEvent.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Time</span>
                    <span className="info-value">{selectedEvent.eventTime}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Venue</span>
                    <span className="info-value">{selectedEvent.eventVenue}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Price</span>
                    <span className="info-value price">Rs.{selectedEvent.priceCustomer}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Description</span>
                    <span className="info-value">{selectedEvent.description || "No description available"}</span>
                  </div>
                </div>
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
          <div className="testimonials-wrapper">
            <button 
              className="testimonial-nav-btn testimonial-prev" 
              onClick={() => scrollTestimonials('prev')}
            >
              <span>‹</span>
            </button>
            <div className="testimonials-slider" ref={testimonialsRef}>
              <EventTestimonials eventId={null} />
            </div>
            <button 
              className="testimonial-nav-btn testimonial-next" 
              onClick={() => scrollTestimonials('next')}
            >
              <span>›</span>
            </button>
          </div>
        </div>

      </div>
      
      <MainFooter />
      
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
