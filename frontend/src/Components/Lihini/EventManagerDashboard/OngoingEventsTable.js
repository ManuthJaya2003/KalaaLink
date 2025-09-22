import React from "react";
import axios from "axios";

const URL = "http://localhost:5000/events";

function OngoingEventsGrid({ events, setEvents, onUpdateEvent }) {
  const deleteEvent = async (id) => {
    try {
      await axios.delete(`${URL}/${id}`);
      setEvents(events.filter((ev) => ev._id !== id));
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      alert("Failed to delete event");
    }
  };

  return (
    <div className="ongoing-events-container">
      <div className="section-header">
        <h1>Ongoing Events</h1>
        <p className="section-subtitle">Manage your current events and track their status</p>
      </div>
      <div className="events-grid">
        {Array.isArray(events) && events.length > 0 ? (
          events.map((ev) => (
            <div key={ev._id} className="event-card">
              <div className="event-image-container">
                {ev.image ? (
                  <img
                    src={`http://localhost:5000${ev.image}`}
                    alt={ev.eventTitle}
                    className="event-image"
                  />
                ) : (
                  <div className="event-placeholder">
                    No Image
                  </div>
                )}
              </div>
              <div className="event-content">
                <h2 className="event-title">{ev.eventTitle}</h2>
                <div className="event-details">
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{ev.eventDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{ev.eventTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Venue:</span>
                    <span className="detail-value">{ev.eventVenue}</span>
                  </div>
                </div>
                <p className="event-description">{ev.eventDescription}</p>
                <div className="event-pricing">
                  <div className="pricing-item">
                    <span className="pricing-label">Price:</span>
                    <span className="pricing-value">{ev.priceCustomer}</span>
                  </div>
                  <div className="pricing-item">
                    <span className="pricing-label">Artist Fee:</span>
                    <span className="pricing-value">{ev.registrationFeeArtist}</span>
                  </div>
                  <div className="pricing-item">
                    <span className="pricing-label">Max Artists:</span>
                    <span className="pricing-value">{ev.maxArtists}</span>
                  </div>
                  <div className="pricing-item">
                    <span className="pricing-label">Max Customers:</span>
                    <span className="pricing-value">{ev.maxCustomers}</span>
                  </div>
                </div>

                {/* Crew Status */}
                <div className="crew-status">
                  <span className="crew-label">Crew Status:</span>
                  <span className="crew-value">
                    {ev.crewRequest ? ev.crewRequest.status : "Not requested"}
                  </span>
                </div>

                <div className="event-actions">
                  <div className="action-buttons">
                    <button
                      onClick={() => onUpdateEvent(ev)}
                      className="btn btn-primary action-btn"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => deleteEvent(ev._id)}
                      className="btn btn-secondary action-btn delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-events">
            <p>No events found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OngoingEventsGrid;
