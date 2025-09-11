import React, { useState, useEffect } from "react";
import axios from "axios";
import OverviewCard from "./OverviewCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LocationModal from "../../Common/LocationModal";

function OverviewAnalyticsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalArtists: 0,
    pendingApprovals: 0,
    rejectedApprovals: 0
  });
  const [chartData, setChartData] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // API endpoints
  const API_BASE = "http://localhost:5000";
  
  // Fetch all artist bookings
  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API_BASE}/bookings`);
      if (response.data && response.data.artistBookings) {
        setBookings(response.data.artistBookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to fetch bookings");
      setBookings([]);
    }
  };

  // Fetch all artists
  const fetchArtists = async () => {
    try {
      const response = await axios.get(`${API_BASE}/artists`);
      if (response.data) {
        setStats(prev => ({ ...prev, totalArtists: response.data.length }));
      } else {
        setStats(prev => ({ ...prev, totalArtists: 0 }));
      }
    } catch (err) {
      console.error("Error fetching artists:", err);
      setStats(prev => ({ ...prev, totalArtists: 0 }));
    }
  };

  // Fetch artist applications for approval counts
  const fetchArtistApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE}/artists/applications`);
      if (response.data) {
        const pending = response.data.pending ? response.data.pending.length : 0;
        const rejected = response.data.rejected ? response.data.rejected.length : 0;
        setStats(prev => ({ 
          ...prev, 
          pendingApprovals: pending,
          rejectedApprovals: rejected
        }));
      } else {
        setStats(prev => ({ 
          ...prev, 
          pendingApprovals: 0,
          rejectedApprovals: 0
        }));
      }
    } catch (err) {
      console.error("Error fetching artist applications:", err);
      setStats(prev => ({ 
        ...prev, 
        pendingApprovals: 0,
        rejectedApprovals: 0
      }));
    }
  };

  // Calculate total revenue from paid bookings
  const calculateRevenue = () => {
    const paidBookings = bookings.filter(booking => 
      booking.paymentStatus === "paid" && booking.status !== "cancelled"
    );
    const totalRevenue = paidBookings.reduce((sum, booking) => {
      // Get the booking price from the artist's profile
      if (booking.artist && typeof booking.artist === 'object') {
        return sum + (booking.artist.bookingPrice || 0);
      }
      return sum;
    }, 0);
    setStats(prev => ({ ...prev, totalRevenue }));
  };

  // Calculate revenue by artist for chart
  const calculateRevenueByArtist = () => {
    const paidBookings = bookings.filter(booking => 
      booking.paymentStatus === "paid" && booking.status !== "cancelled"
    );
    const revenueByArtist = {};

    paidBookings.forEach(booking => {
      if (booking.artist && typeof booking.artist === 'object') {
        const artistName = booking.artist.artistName || booking.artist.stageName || "Unknown Artist";
        const bookingPrice = booking.artist.bookingPrice || 0;
        
        if (revenueByArtist[artistName]) {
          revenueByArtist[artistName] += bookingPrice;
        } else {
          revenueByArtist[artistName] = bookingPrice;
        }
      }
    });

    // Convert to array format for Recharts
    const chartDataArray = Object.entries(revenueByArtist).map(([artistName, revenue]) => ({
      artistName,
      revenue: parseFloat(revenue.toFixed(2))
    }));

    // Sort by revenue (highest first)
    chartDataArray.sort((a, b) => b.revenue - a.revenue);
    setChartData(chartDataArray);
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchBookings(),
        fetchArtists(),
        fetchArtistApplications()
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, []);

  // Update revenue when bookings change
  useEffect(() => {
    calculateRevenue();
    calculateRevenueByArtist();
  }, [bookings]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Get artist name from booking
  const getArtistName = (booking) => {
    if (booking.artist && typeof booking.artist === 'object') {
      return booking.artist.artistName || booking.artist.stageName || "Unknown Artist";
    }
    return "Unknown Artist";
  };

  // Generate PDF Report
  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Add company header
    doc.setFontSize(24);
    doc.setTextColor(30, 58, 138); // Blue color matching the theme
    doc.text('KalaaLink Artist Management System', 105, 20, { align: 'center' });
    
    // Add subtitle
    doc.setFontSize(14);
    doc.setTextColor(107, 114, 128); // Gray color
    doc.text('Comprehensive System Report', 105, 30, { align: 'center' });
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 40, { align: 'center' });
    
    // Add overview statistics
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.text('System Overview', 20, 60);
    
    // Create overview table
    const overviewData = [
      ['Metric', 'Value', 'Description'],
      ['Total Revenue', `LKR ${stats.totalRevenue.toLocaleString()}`, 'Total revenue from all paid bookings'],
      ['Total Artists', stats.totalArtists.toString(), 'Number of artists in the system'],
      ['Pending Approvals', stats.pendingApprovals.toString(), 'Artist applications awaiting approval'],
      ['Rejected Approvals', stats.rejectedApprovals.toString(), 'Rejected artist applications']
    ];
    
    autoTable(doc, {
      startY: 70,
      head: [overviewData[0]],
      body: overviewData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] },
      styles: { fontSize: 10 }
    });
    
    // Add revenue breakdown
    if (chartData.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      const revenueStartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 90;
      doc.text('Revenue by Artist', 20, revenueStartY);
      
      // Create revenue table
      const revenueData = chartData.map(item => [
        item.artistName,
        `LKR ${item.revenue.toLocaleString()}`,
        `${((item.revenue / stats.totalRevenue) * 100).toFixed(1)}%`
      ]);
      
      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 100,
        head: [['Artist Name', 'Revenue', 'Percentage of Total']],
        body: revenueData,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] },
        styles: { fontSize: 9 }
      });
    }
    
    // Add recent bookings
    if (bookings.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      const bookingsStartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 200;
      doc.text('Recent Bookings', 20, bookingsStartY);
      
      // Create bookings table (limit to first 10 for PDF)
      const recentBookings = bookings.slice(0, 10).map(booking => [
        getArtistName(booking),
        booking.customerName,
        formatDate(booking.eventDate),
        booking.eventType,
        booking.paymentStatus,
        booking.eventVenue
      ]);
      
      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 210,
        head: [['Artist', 'Customer', 'Event Date', 'Event Type', 'Status', 'Venue']],
        body: recentBookings,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] },
        styles: { fontSize: 8 }
      });
    }
    
    // Add system information
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    const systemInfoStartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 300;
    doc.text('System Information', 20, systemInfoStartY);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    const baseY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 310;
    doc.text('• KalaaLink Artist Management System provides comprehensive artist booking and management capabilities', 20, baseY);
    doc.text('• The system tracks artist applications, bookings, and revenue generation', 20, baseY + 10);
    doc.text('• Real-time updates ensure accurate data across all dashboard components', 20, baseY + 20);
    doc.text('• Automated approval workflows streamline artist onboarding processes', 20, baseY + 30);
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
    }
    
    // Save the PDF
    doc.save(`KalaaLink_Artist_Management_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleViewLocation = (booking) => {
    setSelectedBooking(booking);
    setIsLocationModalOpen(true);
  };

  const handleManualPaymentUpdate = async (bookingId) => {
    try {
      console.log("🔧 Manually updating payment status for booking:", bookingId);
      
      const response = await axios.put(`${API_BASE}/bookings/${bookingId}/manual-payment-update`);
      
      if (response.data) {
        console.log("✅ Payment status updated successfully:", response.data);
        
        // Refresh the bookings data to show the updated status
        await fetchBookings();
        
        // Show success message
        alert("Payment status updated to 'paid' successfully!");
      }
    } catch (error) {
      console.error("❌ Error updating payment status:", error);
      alert("Failed to update payment status. Please try again.");
    }
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-banner">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button 
            className="retry-btn"
            onClick={fetchAllData}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Overview Cards */}
      <div className="overview-cards-section">
        <div className="overview-cards-container">
          <OverviewCard
            title="Total Revenue"
            value={`LKR ${stats.totalRevenue.toLocaleString()}`}
            description="From all paid bookings"
            icon="💰"
            color="green"
          />
          <OverviewCard
            title="Total Artists"
            value={stats.totalArtists}
            description="Registered in the system"
            icon="🎭"
            color="blue"
          />
          <OverviewCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            description="Awaiting approval"
            icon="⏳"
            color="orange"
          />
          <OverviewCard
            title="Rejected Approvals"
            value={stats.rejectedApprovals}
            description="Rejected registrations"
            icon="❌"
            color="red"
          />
        </div>
        
        {/* Generate PDF Button */}
        <div className="pdf-button-container">
          <button 
            className="generate-pdf-btn"
            onClick={generatePDFReport}
            title="Generate comprehensive PDF report"
          >
            📄 Generate PDF Report
          </button>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="bookings-section">
        <div className="bookings-container">
          <div className="section-header">
            <h2 className="section-title">Artist Bookings</h2>
            <p className="section-subtitle">
              All bookings for artists in the system
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="no-bookings">
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="bookings-table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Artist Booked</th>
                    <th>Event Date</th>
                    <th>Event Type</th>
                    <th>Payment Status</th>
                    <th>Venue</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <tr key={booking._id || index} className="booking-row">
                      <td className="customer-name">{booking.customerName}</td>
                      <td className="artist-name">{getArtistName(booking)}</td>
                      <td className="event-date">{formatDate(booking.eventDate)}</td>
                      <td className="event-type">{booking.eventType}</td>
                      <td className="payment-status">
                        <span className={`status-badge status-${booking.paymentStatus}`}>
                          {booking.paymentStatus}
                        </span>
                        </td>
                      <td className="event-venue">{booking.eventVenue}</td>
                      <td className="actions">
                        <button
                          className="view-location-btn"
                          onClick={() => handleViewLocation(booking)}
                          title="View venue location"
                        >
                          🗺️ View Location
                        </button>
                        {booking.paymentStatus === "pending" && (
                          <button
                            className="manual-payment-btn"
                            onClick={() => handleManualPaymentUpdate(booking._id)}
                            title="Manually mark as paid (for testing)"
                          >
                            💳 Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart Section */}
      <div className="revenue-chart-section">
        <div className="revenue-chart-container">
          <div className="section-header">
            <h2 className="section-title">Revenue by Artist</h2>
            <p className="section-subtitle">
              Total revenue generated by each artist from paid bookings
            </p>
          </div>

          {chartData.length === 0 ? (
            <div className="no-chart-data">
              <p>No revenue data available</p>
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="artistName" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `LKR ${value.toLocaleString()}`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`LKR ${value.toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => `Artist: ${label}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    fill="#667eea" 
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
        booking={selectedBooking}
        title="Venue Location"
      />
    </div>
  );
}

export default OverviewAnalyticsTab;
