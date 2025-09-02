import React from "react";

function Event({ event, onBookNow, onViewDetails }) {
  const { eventTitle, eventDate, eventTime, eventVenue, priceCustomer, image } = event;

  const imageUrl = image
    ? `http://localhost:5000${image.startsWith("/uploads") ? image : `/uploads/${image}`}`
    : null;

  return (
    <div className="event-card">
      <div className="event-image-container">
        {imageUrl ? <img src={imageUrl} alt={eventTitle} className="event-image" /> : <div className="event-image">No Image</div>}
      </div>

      <div className="event-info">
        <h2 className="event-name">{eventTitle}</h2>
        <p className="event-category">{new Date(eventDate).toLocaleDateString()} • {eventTime}</p>
        <p className="detail-value">{eventVenue}</p>
        <p className="detail-value price">Rs.{priceCustomer}</p>

        <div className="event-buttons">
          <button onClick={onBookNow} className="btn btn-primary">Book Now</button>
          <button onClick={onViewDetails} className="btn btn-secondary">View Details</button>
        </div>
      </div>
    </div>
  );
}

export default Event;
