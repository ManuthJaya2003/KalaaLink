const Booking = require("../model/Booking");
const Artist = require("../model/ArtistModel");
const ArtistRegistration = require("../model/artistRegistration");

// Get dashboard overview data
const getDashboardOverview = async (req, res) => {
  try {
    const { artistId } = req.query;

    if (!artistId) {
      return res.status(400).json({ message: "Artist ID is required" });
    }

    // Get total revenue from all paid bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$ticketsBooked" } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get total artists count
    const totalArtists = await ArtistRegistration.countDocuments({ status: "approved" });

    // Get pending bookings count
    const pendingCount = await Booking.countDocuments({ status: "pending" });

    // Get rejected bookings count (assuming rejected status exists)
    const rejectedCount = await Booking.countDocuments({ status: "rejected" });

    const overviewData = {
      totalRevenue,
      totalArtists,
      pending: pendingCount,
      rejected: rejectedCount
    };

    res.status(200).json(overviewData);
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    res.status(500).json({ message: "Failed to fetch dashboard overview", error: error.message });
  }
};

// Get recent bookings
const getRecentBookings = async (req, res) => {
  try {
    const { artistId, limit = 5 } = req.query;

    if (!artistId) {
      return res.status(400).json({ message: "Artist ID is required" });
    }

    // Get recent bookings with event details
    const recentBookings = await Booking.find()
      .populate("event", "title artistName")
      .sort({ bookingDate: -1 })
      .limit(parseInt(limit))
      .select("customerName customerEmail bookingDate status event");

    // Transform the data to match frontend expectations
    const transformedBookings = recentBookings.map(booking => ({
      id: booking._id,
      customer: booking.customerName,
      artistBooked: booking.event?.artistName || "Unknown Artist",
      date: booking.bookingDate,
      status: booking.status,
      eventTitle: booking.event?.title || "Unknown Event"
    }));

    res.status(200).json(transformedBookings);
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    res.status(500).json({ message: "Failed to fetch recent bookings", error: error.message });
  }
};

// Generate dashboard report
const generateDashboardReport = async (req, res) => {
  try {
    const { artistId, overviewData, recentBookings } = req.body;

    if (!artistId) {
      return res.status(400).json({ message: "Artist ID is required" });
    }

    // Here you would implement PDF generation logic
    // For now, we'll just return a success message
    // In a real implementation, you might use libraries like jsPDF or puppeteer
    
    const reportData = {
      generatedAt: new Date(),
      artistId,
      overviewData,
      recentBookings,
      reportId: `REP-${Date.now()}`
    };

    // TODO: Implement actual PDF generation
    // const pdfBuffer = await generatePDF(reportData);
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', `attachment; filename=dashboard-report-${Date.now()}.pdf`);
    // res.send(pdfBuffer);

    res.status(200).json({ 
      message: "Report generated successfully", 
      reportData,
      downloadUrl: `/api/reports/download/${reportData.reportId}` // Placeholder
    });
  } catch (error) {
    console.error("Error generating dashboard report:", error);
    res.status(500).json({ message: "Failed to generate report", error: error.message });
  }
};

// Delete a recent booking
const deleteRecentBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { artistId } = req.query;

    if (!artistId) {
      return res.status(400).json({ message: "Artist ID is required" });
    }

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    // Find and delete the booking
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);
    
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ 
      message: "Booking deleted successfully", 
      deletedBooking 
    });
  } catch (error) {
    console.error("Error deleting recent booking:", error);
    res.status(500).json({ message: "Failed to delete booking", error: error.message });
  }
};

module.exports = {
  getDashboardOverview,
  getRecentBookings,
  generateDashboardReport,
  deleteRecentBooking
};
