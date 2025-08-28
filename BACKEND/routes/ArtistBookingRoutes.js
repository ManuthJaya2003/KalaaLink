const express = require("express");
const router = express.Router();
const {
  getAllArtistBookings,
  getBookingsByArtist,
  createBooking,
  createPaymentIntent,
  confirmBooking,
} = require("../controllers/ArtistBookingController");

// ✅ Get all bookings (Admin / Manager)
router.get("/", getAllArtistBookings);

// ✅ Get bookings by artist (must pass artistId + artistModel)
router.get("/:artistId/:artistModel", getBookingsByArtist);

// ✅ Create new booking
router.post("/", createBooking);

// ✅ Create payment intent
router.post("/create-payment-intent", createPaymentIntent);

// ✅ Confirm booking after payment
router.post("/confirm", confirmBooking);

module.exports = router;
