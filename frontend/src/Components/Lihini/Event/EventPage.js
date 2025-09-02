import React, { useEffect, useState } from "react";
import axios from "axios";
import MainNav from "../../MainNav/MainNav";
import Event from "./Event";
import "./Event.css";

function EventPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/events");
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return (
    <div>
      <MainNav />
      <div className="flex justify-center items-center min-h-screen"><p>Loading events...</p></div>
    </div>
  );

  if (error) return (
    <div>
      <MainNav />
      <div className="flex justify-center items-center min-h-screen"><p>{error}</p></div>
    </div>
  );

  return (
    <div>
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Our Events</h1>
        <div className="events-grid">
          {events.map((event) => <Event key={event._id} event={event} />)}
        </div>
      </div>
    </div>
  );
}

export default EventPage;
