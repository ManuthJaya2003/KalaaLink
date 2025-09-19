import React from "react";

function Event({ event, onBookNow, onViewDetails }) {
  const { eventTitle, eventDate, eventTime, eventVenue, eventDescription, priceCustomer, image } = event;

  const imageUrl = image
    ? `http://localhost:5000${image.startsWith("/uploads") ? image : `/uploads/${image}`}`
    : null;

  return (
    <div className="event-card">
      <div className="event-image-container">
        {imageUrl ? <img src={imageUrl} alt={eventTitle} className="event-image" /> : <div className="event-image">No Image</div>}
      </div>

      <div className="event-info">
        <h2 className="event-title">{eventTitle}</h2>
        <p className="event-date">{new Date(eventDate).toLocaleDateString()} • {eventTime}</p>
        <p className="event-venue">{eventVenue}</p>
        {eventDescription && (
          <p className="event-description">{eventDescription}</p>
        )}
        <p className="detail-value price">Ticket Price (pp): Rs.{priceCustomer}</p>

        <div className="event-buttons">
          <button onClick={onBookNow} className="btn btn-primary">Book Now</button>
          <button onClick={onViewDetails} className="btn btn-secondary">View Details</button>
        </div>
      </div>
    </div>
  );
}

export default Event;
