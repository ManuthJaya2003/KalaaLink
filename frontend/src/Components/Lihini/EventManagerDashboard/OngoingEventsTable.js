import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const URL = "http://localhost:5000/events";

function OngoingEventsGrid({ events, setEvents }) {
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
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Ongoing Events</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {Array.isArray(events) && events.length > 0 ? (
          events.map((ev) => (
            <div
              key={ev._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                background: "#fff",
                transition: "transform 0.2s",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  overflow: "hidden",
                  borderBottom: "1px solid #ddd",
                }}
              >
                {ev.image ? (
                  <img
                    src={`http://localhost:5000${ev.image}`}
                    alt={ev.eventTitle}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#888",
                      fontWeight: "bold",
                    }}
                  >
                    No Image
                  </div>
                )}
              </div>
              <div style={{ padding: "15px" }}>
                <h2 style={{ margin: "0 0 10px", fontSize: "20px", color: "#333" }}>
                  {ev.eventTitle}
                </h2>
                <p style={{ margin: "5px 0", color: "#555" }}>
                  <strong>Date:</strong> {ev.eventDate} <br />
                  <strong>Time:</strong> {ev.eventTime} <br />
                  <strong>Venue:</strong> {ev.eventVenue}
                </p>
                <p style={{ margin: "5px 0", color: "#555" }}>{ev.eventDescription}</p>
                <p style={{ margin: "10px 0", color: "#333", fontWeight: "500" }}>
                  <strong>Price:</strong> {ev.priceCustomer} |{" "}
                  <strong>Artist Fee:</strong> {ev.registrationFeeArtist} <br />
                  <strong>Max Artists:</strong> {ev.maxArtists} |{" "}
                  <strong>Max Customers:</strong> {ev.maxCustomers}
                </p>

                {/* Crew Status */}
                <p style={{ margin: "10px 0", color: "#007BFF", fontWeight: "bold" }}>
                  <strong>Crew Status:</strong>{" "}
                  {ev.crewRequest ? ev.crewRequest.status : "Not requested"}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                  <Link
                    to={`/EventManagerDash/${ev._id}`}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#4CAF50",
                      color: "#fff",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontWeight: "bold",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#45a049")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#4CAF50")}
                  >
                    Update
                  </Link>
                  <button
                    onClick={() => deleteEvent(ev._id)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#f44336",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#e53935")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#f44336")}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>No events found</p>
        )}
      </div>
    </div>
  );
}

export default OngoingEventsGrid;
