import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HomeTab from "./HomeTab";
import OrganizeEventForm from "./OrganizeEventForm";
import OngoingEventsTable from "./OngoingEventsTable";
import AnalyticsTab from "./AnalyticsTab";
import EventUpdate from "../EventUpdate/EventUpdate";
import BookingsTab from "./BookingsTab"; // ✅ new import
import TestimonialsTab from "./TestimonialsTab"; // ✅ new import
import { useParams } from "react-router-dom";
import logoutEmployee from "../../../utils/employeeLogout";
import "./EventManagerDashboard.css";

function EventManagerDashboard({ events, setEvents }) { // ✅ accept props
  const [activeTab, setActiveTab] = useState("home");
  const { id } = useParams(); // ✅ check if we are updating a specific event
  const navigate = useNavigate();
  const [managerName, setManagerName] = useState("Manager");

  // Sign out function
  const handleSignOut = () => {
    logoutEmployee(navigate, "/");
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Fetch manager name (you can replace this with actual manager data)
  useEffect(() => {
    // This would typically come from your authentication context or API
    setManagerName("Manager");
  }, []);

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
    <div className="dashboard-page">
      {/* Fixed Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Event Manager Dashboard</h2>
          <div className="sidebar-logo">
            <img src="/logo.png" alt="KalaaLink Logo" className="logo-icon" />
          </div>
        </div>
        <nav className="sidebar-nav">
          <button 
            onClick={() => setActiveTab("home")} 
            className={`sidebar-btn ${activeTab === "home" ? "active" : ""}`}
          >
            Home
          </button>
          <button 
            onClick={() => setActiveTab("organize")} 
            className={`sidebar-btn ${activeTab === "organize" ? "active" : ""}`}
          >
            Organize Event
          </button>
          <button
            onClick={() => {
              setActiveTab("ongoing");
              fetchEvents(); // refresh events when opening ongoing tab
            }}
            className={`sidebar-btn ${activeTab === "ongoing" ? "active" : ""}`}
          >
            Ongoing Events
          </button>
          <button 
            onClick={() => setActiveTab("analytics")} 
            className={`sidebar-btn ${activeTab === "analytics" ? "active" : ""}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab("bookings")} 
            className={`sidebar-btn ${activeTab === "bookings" ? "active" : ""}`}
          >
            Bookings
          </button>
          <button 
            onClick={() => setActiveTab("testimonials")} 
            className={`sidebar-btn ${activeTab === "testimonials" ? "active" : ""}`}
          >
            Testimonials
          </button>
          <button 
            onClick={handleSignOut} 
            className="sidebar-btn signout-btn"
          >
            Sign Out
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Content Area */}
        <div className="dashboard-content">
          {activeTab === "home" && <HomeTab />}
          {activeTab === "organize" && <OrganizeEventForm events={events} setEvents={setEvents} />}
          {activeTab === "ongoing" && <OngoingEventsTable events={events} setEvents={setEvents} />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "bookings" && <BookingsTab events={events} />}
          {activeTab === "testimonials" && <TestimonialsTab />}
        </div>
      </div>
    </div>
  );
}

export default EventManagerDashboard;
