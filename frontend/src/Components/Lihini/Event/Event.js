import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Event({ event }) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState(1);
  const [message, setMessage] = useState("");

  if (!event) return <p>Loading event...</p>;

  const {
    _id,
    eventTitle,
    eventDate,
    eventTime,
    eventVenue,
    priceCustomer,
    image,
    description,
  } = event;

  const imageUrl = image
    ? `http://localhost:5000${image.startsWith("/uploads") ? image : `/uploads/${image}`}`
    : null;

  // --- Booking handlers ---
  const handleReserve = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/eventBookings", {
        eventId: _id,
        customerName: name,
        customerEmail: email,
        ticketsBooked: Number(tickets),
      });
      setMessage(res.data.message || "Booking reserved successfully");
      setName("");
      setEmail("");
      setTickets(1);
      setTimeout(() => {
        setShowBookingModal(false);
        setShowDetailsModal(false);
        setMessage("");
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  };

  const handlePayNow = async () => {
    try {
      const res = await axios.post("http://localhost:5000/eventBookings", {
        eventId: _id,
        customerName: name || "Anonymous",
        customerEmail: email || "anonymous@example.com",
        ticketsBooked: Number(tickets) || 1,
      });
      const bookingId = res.data.booking._id;
      await axios.put(`http://localhost:5000/eventBookings/${bookingId}/status`, {
        status: "paid",
      });
      setMessage("Payment successful! Booking confirmed.");
      setName("");
      setEmail("");
      setTickets(1);
      setTimeout(() => {
        setShowBookingModal(false);
        setShowDetailsModal(false);
        setMessage("");
      }, 2000);
    } catch (err) {
      console.error(err.response?.data || err);
      setMessage(err.response?.data?.message || "Payment failed");
    }
  };

  // --- Modal overlay handlers ---
  const handleBookingOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowBookingModal(false);
      setMessage("");
    }
  };

  const handleDetailsOverlayClick = (e) => {
    if (e.target === e.currentTarget) setShowDetailsModal(false);
  };

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition duration-300">
      {imageUrl ? (
        <img src={imageUrl} alt={eventTitle} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500">
          No Image
        </div>
      )}

      <div className="p-4 flex flex-col h-full">
        <h2 className="text-xl font-semibold mb-2">{eventTitle}</h2>
        <p className="text-sm text-gray-600">
          <strong>Date:</strong> {new Date(eventDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Time:</strong> {eventTime}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Venue:</strong> {eventVenue}
        </p>
        <p className="text-sm text-gray-800 font-medium mt-2">Price: Rs.{priceCustomer}</p>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowBookingModal(true)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition"
          >
            Book Now
          </button>
          <Link
            to={`/event/${_id}`}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition text-center"
          >
            View More
          </Link>
        </div>
      </div>

      {/* --- Booking Modal --- */}
      {showBookingModal && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleBookingOverlayClick}
        >
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Book Event</h3>
            <form className="flex flex-col gap-3">
              <label className="text-sm">
                Name:
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                />
              </label>
              <label className="text-sm">
                Email:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                />
              </label>
              <label className="text-sm">
                Tickets:
                <input
                  type="number"
                  value={tickets}
                  onChange={(e) => setTickets(e.target.value)}
                  min={1}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                />
              </label>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleReserve}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
                >
                  Reserve
                </button>
                <button
                  type="button"
                  onClick={handlePayNow}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
                >
                  Pay Now
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </form>
            {message && <p className="text-green-600 mt-3 text-sm">{message}</p>}
          </div>
        </div>
      )}

      {/* --- View More Modal with booking functionality --- */}
      {showDetailsModal && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleDetailsOverlayClick}
        >
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{eventTitle}</h3>
            <p><strong>Date:</strong> {new Date(eventDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {eventTime}</p>
            <p><strong>Venue:</strong> {eventVenue}</p>
            <p className="mt-2"><strong>Description:</strong> {description || "No description available"}</p>
            <p className="mt-2"><strong>Price:</strong> Rs.{priceCustomer}</p>

            {/* Booking Inputs inside View More modal */}
            <form className="flex flex-col gap-3 mt-4">
              <label className="text-sm">
                Name:
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                />
              </label>
              <label className="text-sm">
                Email:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                />
              </label>
              <label className="text-sm">
                Tickets:
                <input
                  type="number"
                  value={tickets}
                  onChange={(e) => setTickets(e.target.value)}
                  min={1}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                />
              </label>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleReserve}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
                >
                  Reserve
                </button>
                <button
                  type="button"
                  onClick={handlePayNow}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
                >
                  Pay Now
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </form>

            {message && <p className="text-green-600 mt-3 text-sm">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Event;
