import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BookingsTab.css";

function BookingsTab({ events = [] }) {
  const [bookings, setBookings] = useState([]);
  const [artists, setArtists] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, paid, cancelled
  const [selectedEvent, setSelectedEvent] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/eventBookings");
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  const fetchArtists = async (eventId) => {
    if (!eventId) {
      setArtists([]);
      return;
    }
    
    try {
      const res = await axios.get(`http://localhost:5000/artistsEventRegistration/${eventId}`);
      setArtists(res.data.artists || []);
    } catch (err) {
      console.error("Failed to fetch artists:", err);
      setArtists([]);
    }
  };

  const handleEventChange = (eventId) => {
    setSelectedEvent(eventId);
    fetchArtists(eventId);
  };

  useEffect(() => {
    fetchBookings();
    // Refresh bookings every 15 seconds to get real-time status updates
    const interval = setInterval(fetchBookings, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = async (id) => {
    if (!window.confirm("Are you sure you want to clear this booking? This will permanently delete the booking record.")) return;

    try {
      await axios.delete(`http://localhost:5000/eventBookings/${id}`);
      // Remove from local state
      setBookings(bookings.filter(b => b._id !== id));
    } catch (err) {
      console.error("Failed to clear booking:", err);
      alert("Failed to clear booking");
    }
  };

  const handleRefund = async (id) => {
    if (!window.confirm("Are you sure you want to refund this booking? This will cancel the booking and process a refund.")) return;

    try {
      await axios.put(`http://localhost:5000/eventBookings/${id}/status`, {
        status: "cancelled"
      });
      // Update local state
      setBookings(bookings.map(b => 
        b._id === id ? { ...b, status: "cancelled" } : b
      ));
    } catch (err) {
      console.error("Failed to refund booking:", err);
      alert("Failed to refund booking");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "#f59e0b", bgColor: "#fef3c7", text: "Pending Payment" },
      paid: { color: "#059669", bgColor: "#d1fae5", text: "Paid & Confirmed" },
      cancelled: { color: "#dc2626", bgColor: "#fee2e2", text: "Cancelled" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}
      >
        {config.text}
      </span>
    );
  };

  const filteredBookings = bookings.filter(booking => {
    // Filter by event if one is selected
    if (selectedEvent && booking.event?._id !== selectedEvent) {
      return false;
    }
    // Filter by status
    if (filter === "all") return true;
    return booking.status === filter;
  });

  const getStats = () => {
    // Use filtered bookings for stats when an event is selected
    const bookingsToUse = selectedEvent ? filteredBookings : bookings;
    const total = bookingsToUse.length;
    const pending = bookingsToUse.filter(b => b.status === "pending").length;
    const paid = bookingsToUse.filter(b => b.status === "paid").length;
    const cancelled = bookingsToUse.filter(b => b.status === "cancelled").length;

    return { total, pending, paid, cancelled };
  };

  const stats = getStats();


  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ marginBottom: "20px", color: "#1f2937" }}>Event Bookings Management</h2>
        
        {/* Event Selection Dropdown */}
        <div className="event-filter" style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
            Select Event:
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => handleEventChange(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              backgroundColor: "white",
              fontSize: "14px",
              minWidth: "300px",
              cursor: "pointer"
            }}
          >
            <option value="">All Events</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.eventTitle} - {new Date(event.eventDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        
        {/* Statistics Cards */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "20px", 
          marginBottom: "30px" 
        }}>
          <div style={statCardStyle}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937" }}>{stats.total}</div>
            <div style={{ color: "#6b7280" }}>Total Bookings</div>
          </div>
          <div style={{ ...statCardStyle, borderLeft: "4px solid #f59e0b" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>{stats.pending}</div>
            <div style={{ color: "#6b7280" }}>Pending Payment</div>
          </div>
          <div style={{ ...statCardStyle, borderLeft: "4px solid #059669" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#059669" }}>{stats.paid}</div>
            <div style={{ color: "#6b7280" }}>Paid & Confirmed</div>
          </div>
          <div style={{ ...statCardStyle, borderLeft: "4px solid #dc2626" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#dc2626" }}>{stats.cancelled}</div>
            <div style={{ color: "#6b7280" }}>Cancelled</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              ...filterButtonStyle,
              backgroundColor: filter === "all" ? "#C1A37F" : "#f3f4f6",
              color: filter === "all" ? "white" : "#374151"
            }}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter("pending")}
            style={{
              ...filterButtonStyle,
              backgroundColor: filter === "pending" ? "#f59e0b" : "#f3f4f6",
              color: filter === "pending" ? "white" : "#374151"
            }}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter("paid")}
            style={{
              ...filterButtonStyle,
              backgroundColor: filter === "paid" ? "#059669" : "#f3f4f6",
              color: filter === "paid" ? "white" : "#374151"
            }}
          >
            Paid ({stats.paid})
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            style={{
              ...filterButtonStyle,
              backgroundColor: filter === "cancelled" ? "#dc2626" : "#f3f4f6",
              color: filter === "cancelled" ? "white" : "#374151"
            }}
          >
            Cancelled ({stats.cancelled})
          </button>
        </div>
      </div>


      {/* Customer Bookings Section */}
      <div className="bookings-section" style={{ marginTop: "20px" }}>
        <h3 style={{ marginBottom: "15px", color: "#1f2937", fontSize: "18px", fontWeight: "600" }}>
          Customer Bookings {selectedEvent && `- ${events.find(e => e._id === selectedEvent)?.eventTitle || 'Selected Event'}`}
        </h3>
        
        {filteredBookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            {selectedEvent ? "No bookings found for this event." : "No bookings yet."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Customer Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Event</th>
                  <th style={thStyle}>Tickets</th>
                  <th style={thStyle}>Booking Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                  <th style={thStyle}>Clear</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b._id} style={trStyle}>
                    <td style={tdStyle}>{b.customerName}</td>
                    <td style={tdStyle}>{b.customerEmail}</td>
                    <td style={tdStyle}>
                      <div style={{ maxWidth: "200px" }}>
                        {b.event?.eventTitle || "Deleted Event"}
                      </div>
                    </td>
                    <td style={tdStyle}>{b.ticketsBooked}</td>
                    <td style={tdStyle}>
                      {new Date(b.bookingDate).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      {getStatusBadge(b.status)}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {b.status === "paid" && (
                          <button 
                            onClick={() => handleRefund(b._id)} 
                            style={cancelButtonStyle}
                            title="Refund this confirmed booking"
                          >
                            Refund
                          </button>
                        )}
                        {b.status === "cancelled" && (
                          <span style={{ color: "#dc2626", fontSize: "12px" }}>
                            ✗ Cancelled
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <button 
                          onClick={() => handleClear(b._id)} 
                          className="clear-button"
                          title="Clear this booking record"
                        >
                          Clear
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registered Artists Section */}
      <div className="artists-section" style={{ marginTop: "30px" }}>
        <h3 style={{ marginBottom: "15px", color: "#1f2937", fontSize: "18px", fontWeight: "600" }}>
          Registered Artists {selectedEvent && `- ${events.find(e => e._id === selectedEvent)?.eventTitle || 'Selected Event'}`}
        </h3>
        
        {!selectedEvent ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            Please select an event to view registered artists.
          </div>
        ) : artists.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            No artists registered for this event yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Artist Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Registration Date</th>
                  <th style={thStyle}>Registration Fee</th>
                </tr>
              </thead>
              <tbody>
                {artists.map((artist) => (
                  <tr key={artist._id} style={trStyle}>
                    <td style={tdStyle}>{artist.artistName}</td>
                    <td style={tdStyle}>{artist.artistEmail}</td>
                    <td style={tdStyle}>
                      {new Date(artist.registrationDate).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: "#059669", fontWeight: "600" }}>
                        LKR {artist.registrationFee}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
        <p style={{ margin: "0", fontSize: "14px", color: "#6b7280" }}>
          <strong>Note:</strong> This dashboard automatically refreshes every 15 seconds to show the latest booking statuses. 
          Payment confirmations via Stripe webhooks are processed in real-time.
        </p>
      </div>
    </div>
  );
}

// Styles
const statCardStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  textAlign: "center",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
};

const filterButtonStyle = {
  padding: "8px 16px",
  marginRight: "10px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "500",
  transition: "all 0.2s"
};

// Add hover effect styles
const filterButtonHoverStyle = {
  ...filterButtonStyle,
  backgroundColor: "#000000",
  color: "white"
};

const tableStyle = {
  borderCollapse: "collapse",
  width: "100%",
  backgroundColor: "white",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
};

const thStyle = {
  backgroundColor: "#f9fafb",
  padding: "16px 12px",
  textAlign: "left",
  fontWeight: "600",
  color: "#374151",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px"
};

const trStyle = {
  borderBottom: "1px solid #f3f4f6"
};

const tdStyle = {
  padding: "16px 12px",
  borderBottom: "1px solid #f3f4f6",
  fontSize: "14px",
  color: "#374151"
};

const cancelButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "500",
  transition: "all 0.2s"
};

const clearButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#000000 !important",
  color: "white !important",
  border: "none !important",
  borderRadius: "4px !important",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "500",
  transition: "all 0.2s"
};

export default BookingsTab;
