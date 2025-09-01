import React from "react";
import MainNav from "../../MainNav/MainNav";
import Event from "../Event/Event";

function Events({ events }) {
  return (
    <div>
      <MainNav />
      <h1 className="text-2xl font-bold text-center my-6">Our Events</h1>
      {Array.isArray(events) && events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {events.map((event, i) => (
            <Event key={i} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">No events found</p>
      )}
    </div>
  );
}

export default Events;
