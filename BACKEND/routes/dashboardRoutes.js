const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Get dashboard overview data
router.get("/overview", dashboardController.getDashboardOverview);

// Get recent bookings
router.get("/recent-bookings", dashboardController.getRecentBookings);

// Delete a recent booking
router.delete("/recent-bookings/:bookingId", dashboardController.deleteRecentBooking);

// Generate dashboard report
router.post("/reports/generate", dashboardController.generateDashboardReport);

module.exports = router;
