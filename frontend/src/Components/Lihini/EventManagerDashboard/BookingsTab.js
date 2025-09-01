import React, { useState, useEffect } from "react";
import axios from "axios";

function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/eventBookings"); // your getAllBookings route
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await axios.delete(`http://localhost:5000/eventBookings/${id}`);
      setBookings(bookings.filter((b) => b._id !== id)); // Remove from UI
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Failed to cancel booking");
    }
  };

  if (loading) return <p>Loading bookings...</p>;

  return (
    <div>
      <h2>All Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={thStyle}>Customer Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Event</th>
              <th style={thStyle}>Tickets</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td style={tdStyle}>{b.customerName}</td>
                <td style={tdStyle}>{b.customerEmail}</td>
                <td style={tdStyle}>{b.event?.eventTitle || "Deleted Event"}</td>
                <td style={tdStyle}>{b.ticketsBooked}</td>
                <td style={{ ...tdStyle, color: b.status === "paid" ? "green" : "orange", fontWeight: "bold" }}>
                  {b.status}
                </td>
                <td style={tdStyle}>
                  {b.status === "pending" && (
                    <button onClick={() => handleCancel(b._id)} style={cancelButtonStyle}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = { border: "1px solid #ddd", padding: "8px", backgroundColor: "#f2f2f2" };
const tdStyle = { border: "1px solid #ddd", padding: "8px" };
const cancelButtonStyle = {
  padding: "4px 8px",
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

export default BookingsTab;
