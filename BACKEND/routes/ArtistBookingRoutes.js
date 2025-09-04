const express = require("express");
const router = express.Router();
const {
  getAllArtistBookings,
  getBookingsByArtist,
  createBooking,
  createStripeCheckoutSession,
  handleStripeWebhook,
  confirmBooking,
  updateBookingStatus,
  getArtistById,
  manuallyUpdatePaymentStatus,
} = require("../controllers/ArtistBookingController");

// ✅ Get all bookings (Admin / Manager)
router.get("/", getAllArtistBookings);

// ✅ Get bookings for a specific artist
router.get("/bookings/artist/:artistId", getBookingsByArtist);

// ✅ Get artist profile by ID
router.get("/artist/:artistId", getArtistById);

// ✅ Create new booking
router.post("/", createBooking);

// ✅ Create Stripe checkout session for artist booking (Stripe Link)
router.post("/:id/create-checkout-session", createStripeCheckoutSession);

// ✅ Stripe webhook to handle successful payments
router.post("/webhook", handleStripeWebhook);

// ✅ Manual payment status update for testing (temporary)
router.put("/:bookingId/manual-payment-update", manuallyUpdatePaymentStatus);

// ✅ Confirm booking after payment
router.post("/confirm", confirmBooking);

// ✅ Update booking status
router.put("/:id/status", updateBookingStatus);

module.exports = router;
