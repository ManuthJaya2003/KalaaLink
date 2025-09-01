const Booking = require("../model/Booking");
const Event = require("../model/eventModel");
const ArtistRegistration = require("../model/artistRegistration"); // updated path

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("event");
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching bookings" });
  }
};

// Get bookings for a specific event
const getBookingsByEvent = async (req, res) => {
  const id = req.params.id;
  try {
    const bookings = await Booking.find({ event: id }).populate("event");
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for this event" });
    }
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching event bookings" });
  }
};

// Create a booking
const createBooking = async (req, res) => {
  try {
    const { eventId, customerName, customerEmail, ticketsBooked } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const existingBookings = await Booking.aggregate([
      { $match: { event: eventId } },
      { $group: { _id: null, totalTickets: { $sum: "$ticketsBooked" } } },
    ]);
    const alreadyBooked = existingBookings[0]?.totalTickets || 0;

    if (alreadyBooked + ticketsBooked > event.maxCustomers) {
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    const booking = new Booking({
      event: eventId,
      customerName,
      customerEmail,
      ticketsBooked,
      status: "pending"
    });

    const savedBooking = await booking.save();
    return res.status(201).json({ message: "Booking created, awaiting payment", booking: savedBooking });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create booking", error: err.message });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.status(200).json({ message: "Booking status updated", booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating booking" });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  const id = req.params.id;
  try {
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) return res.status(404).json({ message: "Unable to delete booking" });
    return res.status(200).json({ booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error deleting booking" });
  }
};

// Get booking analytics (customer + artist)
const getBookingAnalytics = async (req, res) => {
  try {
    // Customer bookings
    const customerAnalytics = await Booking.aggregate([
      { $group: { _id: "$event", customerBookings: { $sum: "$ticketsBooked" } } }
    ]);

    // Artist registrations
    const artistAnalytics = await ArtistRegistration.aggregate([
      { $group: { _id: "$event", artistRegistrations: { $sum: 1 } } }
    ]);

    // Merge analytics per event
    const eventIds = new Set([
      ...customerAnalytics.map(c => c._id.toString()),
      ...artistAnalytics.map(a => a._id.toString())
    ]);

    const analytics = [];
    for (const eventId of eventIds) {
      const customer = customerAnalytics.find(c => c._id.toString() === eventId);
      const artist = artistAnalytics.find(a => a._id.toString() === eventId);
      const event = await Event.findById(eventId);

      analytics.push({
        eventName: event?.name || "Unknown Event",
        customerBookings: customer?.customerBookings || 0,
        artistRegistrations: artist?.artistRegistrations || 0
      });
    }

    // Sort by customer bookings descending
    analytics.sort((a, b) => b.customerBookings - a.customerBookings);

    res.status(200).json(analytics);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching booking analytics", error: err.message });
  }
};

module.exports = {
  getAllBookings,
  getBookingsByEvent,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingAnalytics
};
