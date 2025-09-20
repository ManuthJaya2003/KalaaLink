import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LocationModal from "../../Common/LocationModal";
import "./AnalyticsTab.css";
import "./Overview.css";

function OverviewAnalyticsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
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
  const [clearConfirm, setClearConfirm] = useState(null);
  const [bulkClearLoading, setBulkClearLoading] = useState(false);

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
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status. Please try again.");
    }
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
    setSelectedBooking(null);
  };

  // Clear booking functionality
  const handleClearBooking = async (bookingId) => {
    try {
      const response = await axios.delete(`${API_BASE}/bookings/${bookingId}`);
      // Check if the response indicates success (either response.data.success or just a successful HTTP status)
      if (response.status === 200 || response.data?.success) {
        // Remove the booking from the local state
        setBookings(prevBookings => 
          prevBookings.filter(booking => booking._id !== bookingId)
        );
        setClearConfirm(null);
        alert("Booking cleared successfully!");
      } else {
        alert("Failed to clear booking. Please try again.");
      }
    } catch (error) {
      console.error("Error clearing booking:", error);
      // If it's a 404 or similar, still remove from local state as it might already be deleted
      if (error.response?.status === 404) {
        setBookings(prevBookings => 
          prevBookings.filter(booking => booking._id !== bookingId)
        );
        setClearConfirm(null);
        alert("Booking cleared successfully!");
      } else {
        alert("Failed to clear booking. Please try again.");
      }
    }
  };

  // Bulk clear bookings by payment status
  const handleBulkClearBookings = async (status) => {
    console.log('handleBulkClearBookings called with status:', status);
    console.log('API_BASE:', API_BASE);
    console.log('Full URL:', `${API_BASE}/bookings/bulk/status/${status}`);
    
    setBulkClearLoading(true);
    
    try {
      const response = await axios.delete(`${API_BASE}/bookings/bulk/status/${status}`);
      console.log('Response received:', response);
      
      if (response.status === 200) {
        const deletedCount = response.data.deletedCount;
        console.log('Deleted count:', deletedCount);
        
        // Remove bookings with the specified status from local state
        setBookings(prevBookings => 
          prevBookings.filter(booking => booking.paymentStatus !== status)
        );
        
        setClearConfirm(null);
        alert(`Successfully cleared ${deletedCount} ${status} bookings!`);
      } else {
        console.log('Unexpected response status:', response.status);
        alert("Failed to clear bookings. Please try again.");
      }
    } catch (error) {
      console.error("Error clearing bookings by status:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      
      if (error.response?.status === 404) {
        // No bookings found with that status
        setClearConfirm(null);
        alert(`No ${status} bookings found to clear.`);
      } else {
        alert(`Failed to clear bookings. Error: ${error.message}`);
      }
    } finally {
      setBulkClearLoading(false);
    }
  };

  if (error) {
    return (
      <div className="analytics-error">
        <p>Error loading analytics: {error}</p>
        <button onClick={fetchAllData}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Page Header */}
      <div className="analytics-page-header">
        <h1 className="analytics-page-title">Artist Analytics</h1>
        <p className="analytics-page-subtitle">Comprehensive insights and performance metrics for your artists</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-content">
            <h3>Total Revenue</h3>
            <div className="card-value">{`LKR ${stats.totalRevenue.toLocaleString()}`}</div>
            <p>From all paid bookings</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <h3>Total Artists</h3>
            <div className="card-value">{stats.totalArtists}</div>
            <p>Registered in the system</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <h3>Pending Approvals</h3>
            <div className="card-value">{stats.pendingApprovals}</div>
            <p>Awaiting approval</p>
          </div>
        </div>

        <div className="summary-card negative">
          <div className="card-content">
            <h3>Rejected Approvals</h3>
            <div className="card-value">{stats.rejectedApprovals}</div>
            <p>Rejected registrations</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="analytics-main">
        {/* Chart Section */}
        <div className="chart-section">
          <h2>Revenue by Artist</h2>
          <p>A visual breakdown of revenue generated per artist.</p>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="artistName" 
                  angle={-30}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Revenue']}
                  labelStyle={{ color: '#333' }}
                />
                <Bar dataKey="revenue" fill="#C1A37F" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Table Section */}
        <div className="table-section">
          <div className="table-header">
            <div className="table-title">
              <h2>Artist Bookings</h2>
              <p>All bookings for artists in the system.</p>
            </div>
            <div className="bulk-actions">
              <button
                className="btn btn-warning"
                onClick={() => {
                  console.log('Clear All Paid clicked');
                  console.log('Bookings with paid status:', bookings.filter(b => b.paymentStatus === 'paid').length);
                  setClearConfirm({ type: 'bulk', status: 'paid' });
                }}
                disabled={!bookings.some(b => b.paymentStatus === 'paid') || bulkClearLoading}
                title="Clear all paid bookings"
              >
                {bulkClearLoading ? 'Clearing...' : `Clear All Paid (${bookings.filter(b => b.paymentStatus === 'paid').length})`}
              </button>
              <button
                className="btn btn-warning"
                onClick={() => {
                  console.log('Clear All Pending clicked');
                  console.log('Bookings with pending status:', bookings.filter(b => b.paymentStatus === 'pending').length);
                  setClearConfirm({ type: 'bulk', status: 'pending' });
                }}
                disabled={!bookings.some(b => b.paymentStatus === 'pending') || bulkClearLoading}
                title="Clear all pending bookings"
              >
                {bulkClearLoading ? 'Clearing...' : `Clear All Pending (${bookings.filter(b => b.paymentStatus === 'pending').length})`}
              </button>
            </div>
          </div>
          
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Artist Booked</th>
                  <th>Event Date</th>
                  <th>Event Type</th>
                  <th>Payment Status</th>
                  <th>Venue</th>
                  <th>Actions</th>
                  <th>Clear</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking, index) => (
                    <tr key={booking._id || index}>
                      <td>{booking.customerName}</td>
                      <td>{getArtistName(booking)}</td>
                      <td>{formatDate(booking.eventDate)}</td>
                      <td>{booking.eventType}</td>
                      <td>
                        <span className={`status-badge status-${booking.paymentStatus}`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td>{booking.eventVenue}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleViewLocation(booking)}
                            title="View venue location"
                          >
                            View Location
                          </button>
                          {booking.paymentStatus === "pending" && (
                            <button
                              className="btn btn-success"
                              onClick={() => handleManualPaymentUpdate(booking._id)}
                              title="Manually mark as paid (for testing)"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          className="clear-button"
                          onClick={() => setClearConfirm(booking)}
                          title="Clear this booking"
                        >
                          Clear
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generate Report Button at Bottom */}
      <div className="analytics-bottom-section">
        <button className="generate-report-btn-bottom" onClick={generatePDFReport}>
          Generate Report
        </button>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
        booking={selectedBooking}
        title="Venue Location"
      />

      {/* Clear Confirmation Modal */}
      {clearConfirm && (
        <div className="delete-modal-overlay" onClick={() => setClearConfirm(null)}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>
                {clearConfirm.type === 'bulk' 
                  ? `Clear All ${clearConfirm.status.charAt(0).toUpperCase() + clearConfirm.status.slice(1)} Bookings`
                  : 'Clear Booking'
                }
              </h3>
              <button 
                className="delete-modal-close" 
                onClick={() => setClearConfirm(null)}
              >
                ×
              </button>
            </div>
            <div className="delete-modal-body">
              {clearConfirm.type === 'bulk' ? (
                <>
                  <p>Are you sure you want to clear <strong>ALL</strong> {clearConfirm.status} bookings?</p>
                  <p><strong>Status:</strong> {clearConfirm.status.charAt(0).toUpperCase() + clearConfirm.status.slice(1)}</p>
                  <p><strong>Count:</strong> {bookings.filter(b => b.paymentStatus === clearConfirm.status).length} bookings will be deleted</p>
                  <p className="warning-text">This action cannot be undone and will affect multiple bookings.</p>
                </>
              ) : (
                <>
                  <p>Are you sure you want to clear this booking?</p>
                  <p><strong>Customer:</strong> {clearConfirm.customerName}</p>
                  <p><strong>Artist:</strong> {getArtistName(clearConfirm)}</p>
                  <p><strong>Event Date:</strong> {formatDate(clearConfirm.eventDate)}</p>
                  <p><strong>Event Type:</strong> {clearConfirm.eventType}</p>
                  <p className="warning-text">This action cannot be undone.</p>
                </>
              )}
            </div>
            <div className="delete-modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setClearConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  console.log('Confirmation button clicked');
                  console.log('clearConfirm:', clearConfirm);
                  if (clearConfirm.type === 'bulk') {
                    console.log('Calling handleBulkClearBookings');
                    handleBulkClearBookings(clearConfirm.status);
                  } else {
                    console.log('Calling handleClearBooking');
                    handleClearBooking(clearConfirm._id);
                  }
                }}
                disabled={bulkClearLoading}
              >
                {bulkClearLoading 
                  ? 'Clearing...' 
                  : clearConfirm.type === 'bulk' 
                    ? `Clear All ${clearConfirm.status.charAt(0).toUpperCase() + clearConfirm.status.slice(1)}`
                    : 'Clear Booking'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OverviewAnalyticsTab;
