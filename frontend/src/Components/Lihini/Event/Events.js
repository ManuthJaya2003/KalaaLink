import React, { useEffect, useState } from "react";
import axios from "axios";
import Event from "./Event";
import "./Event.css"; // Fixed import path

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/events"); // fetch all events
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p className="text-center mt-8">Loading events...</p>;
  if (!events.length) return <p className="text-center mt-8">No events available</p>;

  return (
    <div className="events-grid">
      {events.map((event) => (
        <Event key={event._id} event={event} />
      ))}
    </div>
  );
}

export default Events;
