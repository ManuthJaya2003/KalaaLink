const Booking = require("../model/Booking");
const Artist = require("../model/ArtistModel");
const ArtistRegistration = require("../model/artistRegistration");
const User = require("../model/UserModel");
const Art = require("../model/Art");
const Order = require("../model/Order");
const Event = require("../model/eventModel");

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

// Get system overview data for admin dashboard
const getSystemOverview = async (req, res) => {
  try {
    // Get total revenue from all paid bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$ticketsBooked" } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get total active users
    const totalUsers = await User.countDocuments();

    // Get total bookings
    const totalBookings = await Booking.countDocuments();

    // Get total products sold (art pieces)
    const totalProductsSold = await Art.countDocuments();

    // Get additional statistics
    const totalArtists = await ArtistRegistration.countDocuments({ status: "approved" });
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const paidBookings = await Booking.countDocuments({ status: "paid" });

    const systemOverview = {
      totalRevenue,
      totalUsers,
      totalBookings,
      totalProductsSold,
      totalArtists,
      pendingBookings,
      paidBookings
    };

    res.status(200).json(systemOverview);
  } catch (error) {
    console.error("Error fetching system overview:", error);
    res.status(500).json({ message: "Failed to fetch system overview", error: error.message });
  }
};

// Get chart data for system overview
const getChartData = async (req, res) => {
  try {
    // Get event registrations over time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const eventRegistrations = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Format event registrations data for line chart
    const lineChartData = eventRegistrations.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      registrations: item.count
    }));

    // Get revenue distribution data
    const bookingRevenue = await Booking.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$ticketsBooked" } } }
    ]);

    const artRevenue = await Art.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const orderRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    // Format revenue distribution data for pie chart
    const pieChartData = [
      {
        name: "Event Bookings",
        value: bookingRevenue[0]?.total || 0,
        color: "#4CAF50"
      },
      {
        name: "Art Sales",
        value: artRevenue[0]?.total || 0,
        color: "#2196F3"
      },
      {
        name: "Custom Orders",
        value: orderRevenue[0]?.total || 0,
        color: "#FF9800"
      }
    ];

    // Get key metrics for bar chart
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalArtists = await ArtistRegistration.countDocuments({ status: "approved" });
    const totalRevenue = (bookingRevenue[0]?.total || 0) + (artRevenue[0]?.total || 0) + (orderRevenue[0]?.total || 0);

    const barChartData = [
      { name: "Revenue", value: totalRevenue, color: "#4CAF50" },
      { name: "Users", value: totalUsers, color: "#2196F3" },
      { name: "Bookings", value: totalBookings, color: "#FF9800" },
      { name: "Artists", value: totalArtists, color: "#9C27B0" }
    ];

    const chartData = {
      lineChart: lineChartData,
      pieChart: pieChartData,
      barChart: barChartData
    };

    res.status(200).json(chartData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ message: "Failed to fetch chart data", error: error.message });
  }
};

module.exports = {
  getDashboardOverview,
  getRecentBookings,
  generateDashboardReport,
  deleteRecentBooking,
  getSystemOverview,
  getChartData
};
