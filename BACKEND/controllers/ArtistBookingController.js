const mongoose = require("mongoose");
const ArtistBooking = require("../model/ArtistBookingModel");
const Artist = require("../model/ArtistManagerModel");
const RegisteredArtist = require("../model/ArtistModel");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper to populate artist dynamically
const populateArtist = async (booking) => {
  let artistData = null;
  if (booking.artistModel === "artistmanagermodels") {
    artistData = await Artist.findById(booking.artist);
  } else if (booking.artistModel === "artists") {
    artistData = await RegisteredArtist.findById(booking.artist);
  }
  return { ...booking._doc, artist: artistData, artistModel: booking.artistModel };
};

// Get all bookings (admin/manager)
const getAllArtistBookings = async (req, res) => {
  try {
    const artistBookings = await ArtistBooking.find();

    if (!artistBookings || artistBookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    const populatedBookings = await Promise.all(
      artistBookings.map((booking) => populateArtist(booking))
    );

    res.status(200).json({ artistBookings: populatedBookings });
  } catch (err) {
    console.error("Error in getAllArtistBookings:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get bookings by artist (automatically reads artistModel)
const getBookingsByArtist = async (req, res) => {
  try {
    const { artistId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(artistId)) {
      return res.status(400).json({ message: "Invalid artist ID" });
    }

    const bookings = await ArtistBooking.find({ artist: artistId });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for this artist" });
    }

    const populatedBookings = await Promise.all(
      bookings.map((booking) => populateArtist(booking))
    );

    res.status(200).json({ bookings: populatedBookings });
  } catch (err) {
    console.error("Error in getBookingsByArtist:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create a booking (pending payment)
const createBooking = async (req, res) => {
  const {
    artistId,
    artistModel,
    customerName,
    customerEmail,
    customerPhoneNumber,
    eventType,
    eventDate,
    eventTime,
    eventVenue,
    eventLocation,
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
    console.error("Error in createBooking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { bookingId },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Error in createPaymentIntent:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Confirm booking after payment
const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await ArtistBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = "paid";
    await booking.save();

    res.status(200).json({ message: "Booking confirmed", booking });
  } catch (err) {
    console.error("Error in confirmBooking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await ArtistBooking.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ 
      message: "Booking status updated successfully", 
      booking 
    });
  } catch (err) {
    console.error("Error in updateBookingStatus:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single artist by ID (for artist profile)
const getArtistById = async (req, res) => {
  try {
    const { artistId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(artistId)) {
      return res.status(400).json({ message: "Invalid artist ID" });
    }

    let artistData = await RegisteredArtist.findById(artistId);
    let artistType = "artists";

    if (!artistData) {
      artistData = await Artist.findById(artistId);
      artistType = "artistmanagermodels";
    }

    if (!artistData) {
      return res.status(404).json({ message: "Artist not found" });
    }

    res.status(200).json({
      success: true,
      artist: {
        id: artistData._id,
        name: artistData.artistName,
        genre: artistData.genre,
        category: artistData.category,
        bookingPrice: artistData.bookingPrice,
        summary: artistData.summary,
        bio: artistData.bio,
        image: artistData.image,
        artistType,
      },
    });
  } catch (err) {
    console.error("Error in getArtistById:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getAllArtistBookings,
  getBookingsByArtist,
  createBooking,
  createPaymentIntent,
  confirmBooking,
  updateBookingStatus,
  getArtistById,
};
