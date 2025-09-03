const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Create a booking
router.post("/", bookingController.createBooking);

// Get all bookings
router.get("/", bookingController.getAllBookings);

// Get a specific booking by ID
router.get("/booking/:id", bookingController.getBookingById);

// Get bookings by event
router.get("/event/:eventId", bookingController.getBookingsByEvent);

// Update booking status
router.put("/:id/status", bookingController.updateBookingStatus);

// Delete a booking
router.delete("/:id", bookingController.deleteBooking);

// Analytics route
router.get("/analytics", bookingController.getBookingAnalytics);

// Stripe checkout session for event bookings
router.post("/:id/create-checkout-session", bookingController.createStripeCheckoutSession);

// Stripe webhook to handle successful payments
router.post("/webhook", bookingController.handleStripeWebhook);

// Test webhook endpoint (for debugging)
router.post("/webhook-test", (req, res) => {
  console.log("Webhook test endpoint hit");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  res.json({ 
    message: "Webhook test successful", 
    timestamp: new Date().toISOString(),
    headers: req.headers,
    body: req.body
  });
});

// Test endpoint to manually verify payment status
router.get("/test-payment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await require("../model/Booking").findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.json({
      bookingId: id,
      status: booking.status,
      message: `Current status: ${booking.status}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
