const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Create a booking
router.post("/", bookingController.createBooking);

// Get all bookings
router.get("/", bookingController.getAllBookings);

// Get bookings by event
router.get("/:id", bookingController.getBookingsByEvent);

// Update booking status
router.put("/:id/status", bookingController.updateBookingStatus);

// Delete a booking
router.delete("/:id", bookingController.deleteBooking);

// Analytics route
router.get("/analytics", bookingController.getBookingAnalytics);

module.exports = router;
