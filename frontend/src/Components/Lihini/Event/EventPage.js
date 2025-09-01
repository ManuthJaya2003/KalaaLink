import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import MainNav from "../../MainNav/MainNav";
import Event from "./Event";

function EventPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/events/${id}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  if (loading) {
    return (
      <div>
        <MainNav />
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <MainNav />
        <div className="flex justify-center items-center min-h-screen">
          <p>Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <Event event={event} />
      </div>
    </div>
  );
}

export default EventPage;
