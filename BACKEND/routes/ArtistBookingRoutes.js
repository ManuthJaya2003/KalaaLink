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
  clearCompletedAndCancelledBookings,
  testWebhookEndpoint,
  getBookingStatus,
  verifyPaymentManually,
  autoVerifyAllPendingBookings,
  generateInvoice,
  deleteBooking,
  deleteBookingsByStatus,
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

// ✅ Delete individual booking
router.delete("/:id", deleteBooking);

// ✅ Clear completed and cancelled bookings for an artist
router.delete("/clear/:artistId", clearCompletedAndCancelledBookings);

// ✅ Test webhook endpoint for debugging
router.post("/webhook-test", testWebhookEndpoint);

// ✅ Get booking status for testing
router.get("/test-payment/:bookingId", getBookingStatus);

// ✅ Manual payment verification using Stripe session ID
router.post("/verify-payment", verifyPaymentManually);

// ✅ Auto-verify all pending bookings (for testing)
router.post("/auto-verify-all", autoVerifyAllPendingBookings);

// ✅ Generate invoice for booking
router.post("/generate-invoice", generateInvoice);

// ✅ Bulk delete bookings by payment status
router.delete("/bulk/status/:status", deleteBookingsByStatus);

module.exports = router;
