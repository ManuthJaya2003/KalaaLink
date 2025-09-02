import React, { useState } from "react";
import MainNav from "../../MainNav/MainNav";
import Event from "../Event/Event";
import "../Event/Event.css"; // Import the custom CSS for grid layout

function Events({ events }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
    setSelectedEvent(null);
  };

  return (
    <div>
      <MainNav />
      <h1 className="text-2xl font-bold text-center my-6">Our Events</h1>
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
        <p className="text-center text-gray-500 mt-10">No events found</p>
      )}

      {/* Booking Modal - Rendered at Events level */}
      {showBookingModal && selectedEvent && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Book Event</h3>
              <button className="modal-close" onClick={closeModals}>×</button>
            </div>
            <div className="modal-body">
              <BookingForm event={selectedEvent} onClose={closeModals} />
            </div>
          </div>
        </div>
      )}

      {/* Details Modal - Rendered at Events level */}
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
              <BookingForm event={selectedEvent} onClose={closeModals} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// BookingForm component moved to Events level
function BookingForm({ event, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState(1);
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setTickets(1);
    setMessage("");
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/eventBookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event._id,
          customerName: name,
          customerEmail: email,
          ticketsBooked: Number(tickets),
        }),
      });
      const data = await res.json();
      setMessage(data.message || "Booking reserved successfully");
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
    } catch (err) {
      setMessage("Booking failed");
    }
  };

  const handlePayNow = async () => {
    try {
      const res = await fetch("http://localhost:5000/eventBookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event._id,
          customerName: name || "Anonymous",
          customerEmail: email || "anonymous@example.com",
          ticketsBooked: Number(tickets) || 1,
        }),
      });
      const data = await res.json();
      if (data.booking) {
        await fetch(`http://localhost:5000/eventBookings/${data.booking._id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "paid" }),
        });
        setMessage("Payment successful! Booking confirmed.");
        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setMessage("Payment failed");
    }
  };

  return (
    <form className="modal-form">
      <div className="detail-item">
        <label className="detail-label">Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
      </div>
      <div className="detail-item">
        <label className="detail-label">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
      </div>
      <div className="detail-item">
        <label className="detail-label">Tickets</label>
        <input type="number" min={1} value={tickets} onChange={(e) => setTickets(e.target.value)} className="input-field" />
      </div>
      <div className="event-buttons mt-4">
        <button type="button" onClick={handleReserve} className="btn btn-primary">Reserve</button>
        <button type="button" onClick={handlePayNow} className="btn btn-secondary">Pay Now</button>
      </div>
      {message && <p className="success-msg">{message}</p>}
    </form>
  );
}

export default Events;
