const express = require("express");
const router = express.Router();
const {
  getAllArtistBookings,
  getBookingsByArtist,
  createBooking,
  createPaymentIntent,
  confirmBooking,
  getArtistById,
} = require("../controllers/ArtistBookingController");

// ✅ Get all bookings (Admin / Manager)
router.get("/", getAllArtistBookings);

// ✅ Get bookings for a specific artist
router.get("/bookings/artist/:artistId", getBookingsByArtist);

// ✅ Get artist profile by ID
router.get("/artist/:artistId", getArtistById);

// ✅ Create new booking
router.post("/", createBooking);

// ✅ Create payment intent
router.post("/create-payment-intent", createPaymentIntent);

// ✅ Confirm booking after payment
router.post("/confirm", confirmBooking);

module.exports = router;
