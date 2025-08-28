const ArtistBooking = require("../model/ArtistBookingModel");
const Artist = require("../model/ArtistModel");
const RegisteredArtist = require("../model/ArtistModel");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Helper to populate artist based on artistModel
const populateArtist = async (booking) => {
  let artistData = null;
  if (booking.artistModel === "Artist") {
    artistData = await Artist.findById(booking.artist);
  } else if (booking.artistModel === "RegisteredArtist") {
    artistData = await RegisteredArtist.findById(booking.artist);
  }
  return { ...booking._doc, artist: artistData };
};

// ✅ Get all bookings (for admin/manager)
const getAllArtistBookings = async (req, res) => {
  try {
    const artistBookings = await ArtistBooking.find();
    if (!artistBookings || artistBookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    // dynamically attach artist data
    const populatedBookings = await Promise.all(
      artistBookings.map((booking) => populateArtist(booking))
    );

    res.status(200).json({ artistBookings: populatedBookings });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get bookings by artist (for artist dashboard)
const getBookingsByArtist = async (req, res) => {
  try {
    const { artistId, artistModel } = req.params;
    const bookings = await ArtistBooking.find({ artist: artistId, artistModel });

    const populatedBookings = await Promise.all(
      bookings.map((booking) => populateArtist(booking))
    );

    res.status(200).json({ bookings: populatedBookings });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Create a booking (pending payment)
const createBooking = async (req, res) => {
  const {
    artistId,
    artistModel, // "Artist" OR "RegisteredArtist"
    customerName,
    customerEmail,
    customerPhoneNumber,
    eventType,
    eventDate,
    eventTime,
    eventVenue,
    eventLocation, // { lat, lng }
  } = req.body;

  try {
    const newBooking = new ArtistBooking({
      artist: artistId,
      artistModel,
      customerName,
      customerEmail,
      customerPhoneNumber,
      eventType,
      eventDate,
      eventTime,
      eventVenue,
      eventLocation,
      paymentStatus: "pending",
    });

    await newBooking.save();
    res.status(201).json({ booking: newBooking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, amount } = req.body; // amount in cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { bookingId },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Confirm booking after payment
const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await ArtistBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = "paid";
    await booking.save();

    res.status(200).json({ message: "Booking confirmed", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllArtistBookings,
  getBookingsByArtist,
  createBooking,
  createPaymentIntent,
  confirmBooking,
};
