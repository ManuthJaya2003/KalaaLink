import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HomeTab from "./HomeTab";
import OrganizeEventForm from "./OrganizeEventForm";
import OngoingEventsTable from "./OngoingEventsTable";
import AnalyticsTab from "./AnalyticsTab";
import EventUpdate from "../EventUpdate/EventUpdate";
import BookingsTab from "./BookingsTab"; // ✅ new import
import { useParams } from "react-router-dom";
import logoutEmployee from "../../../utils/employeeLogout";

function EventManagerDashboard({ events, setEvents }) { // ✅ accept props
  const [activeTab, setActiveTab] = useState("home");
  const { id } = useParams(); // ✅ check if we are updating a specific event
  const navigate = useNavigate();

  // Sign out function
  const handleSignOut = () => {
    logoutEmployee(navigate, "/");
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/events");
      setEvents(Array.isArray(res.data) ? res.data : res.data.events || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ If id exists → show EventUpdate instead of dashboard tabs
  if (id) {
    return <EventUpdate />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Navigation Bar */}
      <div
        style={{
          background: "#34495e",
          color: "white",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #2c3e50",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          Event Manager Dashboard
        </h1>
        <button
          onClick={handleSignOut}
          style={{
            background: "#e74c3c",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => e.target.style.background = "#c0392b"}
          onMouseLeave={(e) => e.target.style.background = "#e74c3c"}
        >
          Sign Out
        </button>
      </div>

      {/* Main Dashboard Container */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div
          style={{
            width: "220px",
            background: "#2c3e50",
            color: "white",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
          }}
        >
        <h2 style={{ marginBottom: "30px" }}>Dashboard</h2>
        <button onClick={() => setActiveTab("home")} style={getButtonStyle(activeTab === "home")}>Home</button>
        <button onClick={() => setActiveTab("organize")} style={getButtonStyle(activeTab === "organize")}>Organize Event</button>
        <button
          onClick={() => {
            setActiveTab("ongoing");
            fetchEvents(); // refresh events when opening ongoing tab
          }}
          style={getButtonStyle(activeTab === "ongoing")}
        >
          Ongoing Events
        </button>
        <button onClick={() => setActiveTab("analytics")} style={getButtonStyle(activeTab === "analytics")}>Analytics</button>
        <button onClick={() => setActiveTab("bookings")} style={getButtonStyle(activeTab === "bookings")}>Bookings</button> {/* ✅ new button */}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "20px" }}>
          {activeTab === "home" && <HomeTab />}
          {activeTab === "organize" && <OrganizeEventForm events={events} setEvents={setEvents} />}
          {activeTab === "ongoing" && <OngoingEventsTable events={events} setEvents={setEvents} />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "bookings" && <BookingsTab events={events} />} {/* ✅ new tab content */}
        </div>
      </div>
    </div>
  );
}

const getButtonStyle = (isActive) => ({
  background: isActive ? "#34495e" : "transparent",
  border: "none",
  color: "white",
  textAlign: "left",
  padding: "10px 0",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: isActive ? "bold" : "normal",
});

export default EventManagerDashboard;
