const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Get dashboard overview data
router.get("/overview", dashboardController.getDashboardOverview);

// Get system overview data for admin dashboard
router.get("/system-overview", dashboardController.getSystemOverview);

// Get chart data for system overview
router.get("/chart-data", dashboardController.getChartData);

// Get recent bookings
router.get("/recent-bookings", dashboardController.getRecentBookings);

// Delete a recent booking
router.delete("/recent-bookings/:bookingId", dashboardController.deleteRecentBooking);

// Generate dashboard report
router.post("/reports/generate", dashboardController.generateDashboardReport);

module.exports = router;
