import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import MainNav from "../../MainNav/MainNav";
import ArtistManagerNav from "../ArtistManagerNav/ArtistManagerNav";
import OverviewCard from "./OverviewCard";
import "./Overview.css";

function Overview() {
  const [overviewData, setOverviewData] = useState({
    totalRevenue: 0,
    totalArtists: 0,
    pending: 0,
    rejected: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock artist ID - in real app this would come from auth context
  const currentArtistId = "mock-artist-id";

  // Fetch overview data
  const fetchOverviewData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/dashboard/overview?artistId=${currentArtistId}`);
      setOverviewData(response.data);
    } catch (err) {
      console.error("Error fetching overview data:", err);
      setError("Failed to load overview data");
      // Fallback to mock data for development
      const mockData = {
        totalRevenue: 12500,
        totalArtists: 24,
        pending: 8,
        rejected: 3
      };
      setOverviewData(mockData);
    }
  };

  // Fetch recent bookings
  const fetchRecentBookings = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/dashboard/recent-bookings?artistId=${currentArtistId}&limit=5`);
      setRecentBookings(response.data);
    } catch (err) {
      console.error("Error fetching recent bookings:", err);
      setError("Failed to load recent bookings");
      // Fallback to mock data for development
      const mockBookings = [
        {
          id: 1,
          customer: "John Smith",
          artistBooked: "Sarah Johnson",
          date: "2024-01-15",
          status: "confirmed"
        },
        {
          id: 2,
          customer: "Emily Davis",
          artistBooked: "Mike Wilson",
          date: "2024-01-14",
          status: "pending"
        },
        {
          id: 3,
          customer: "David Brown",
          artistBooked: "Lisa Anderson",
          date: "2024-01-13",
          status: "confirmed"
        },
        {
          id: 4,
          customer: "Jessica Lee",
          artistBooked: "Tom Martinez",
          date: "2024-01-12",
          status: "confirmed"
        },
        {
          id: 5,
          customer: "Michael Chen",
          artistBooked: "Amy Rodriguez",
          date: "2024-01-11",
          status: "confirmed"
        }
      ];
      setRecentBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  // Delete a booking
  const handleDeleteBooking = async (bookingId, event) => {
    event.stopPropagation(); // Prevent row click event
    
    if (!window.confirm("Are you sure you want to delete this booking record? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/dashboard/recent-bookings/${bookingId}?artistId=${currentArtistId}`);
      
      // Remove the booking from the local state
      setRecentBookings(prevBookings => 
        prevBookings.filter(booking => booking.id !== bookingId)
      );
      
      // Show success message
      setError(null);
      console.log("Booking deleted successfully");
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError("Failed to delete booking. Please try again.");
    }
  };

  // Generate PDF report
  const generateReport = async () => {
    try {
      // Create PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Artist Manager Dashboard Report", 20, 30);
      
      // Add generation date
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      
      // Add overview data
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Overview Statistics", 20, 65);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Revenue: $${overviewData.totalRevenue.toLocaleString()}`, 20, 80);
      doc.text(`Total Artists: ${overviewData.totalArtists}`, 20, 90);
      doc.text(`Pending Bookings: ${overviewData.pending}`, 20, 100);
      doc.text(`Rejected Bookings: ${overviewData.rejected}`, 20, 110);
      
      // Add recent bookings table manually
      if (recentBookings.length > 0) {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Recent Bookings", 20, 135);
        
        // Table headers
        const headers = ['Customer', 'Artist Booked', 'Date', 'Status', 'Actions'];
        const startY = 150;
        const colWidths = [50, 50, 40, 30, 25];
        const startX = 20;
        
        // Draw header background
        doc.setFillColor(139, 92, 246);
        doc.rect(startX, startY - 5, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
        
        // Draw header text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        let currentX = startX;
        headers.forEach((header, index) => {
          doc.text(header, currentX + 2, startY);
          currentX += colWidths[index];
        });
        
        // Reset text color for data
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        
        // Draw table data
        let currentY = startY + 10;
        recentBookings.forEach((booking, rowIndex) => {
          // Alternate row colors
          if (rowIndex % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(startX, currentY - 5, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
          }
          
          // Draw cell borders
          doc.setDrawColor(229, 231, 235);
          doc.setLineWidth(0.1);
          let cellX = startX;
          colWidths.forEach((width) => {
            doc.rect(cellX, currentY - 5, width, 8, 'S');
            cellX += width;
          });
          
          // Add data
          currentX = startX;
          const rowData = [
            booking.customer,
            booking.artistBooked,
            new Date(booking.date).toLocaleDateString(),
            booking.status,
            "Delete"
          ];
          
          rowData.forEach((cellData, colIndex) => {
            // Truncate long text
            let displayText = cellData;
            if (displayText.length > 15) {
              displayText = displayText.substring(0, 12) + '...';
            }
            doc.text(displayText, currentX + 2, currentY);
            currentX += colWidths[colIndex];
          });
          
          currentY += 10;
        });
      }
      
      // Save the PDF
      const fileName = `dashboard-report-${Date.now()}.pdf`;
      doc.save(fileName);
      
      // Also send to backend for logging (optional)
      try {
        await axios.post('http://localhost:5000/api/dashboard/reports/generate', {
          artistId: currentArtistId,
          overviewData,
          recentBookings
        });
      } catch (backendErr) {
        console.log("Backend logging failed, but PDF was generated successfully");
      }
      
      console.log("PDF report generated and downloaded successfully!");
      alert("PDF report generated and downloaded successfully!");
    } catch (err) {
      console.error("Error generating PDF report:", err);
      alert("Failed to generate PDF report. Check console for details.");
    }
  };

  // Polling for real-time updates
  useEffect(() => {
    fetchOverviewData();
    fetchRecentBookings();

    // Set up polling every 10 seconds
    const interval = setInterval(() => {
      fetchOverviewData();
      fetchRecentBookings();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Handle booking row click
  const handleBookingClick = (booking) => {
    console.log("Booking clicked:", booking);
    // In real implementation, this would navigate to booking details
    // navigate(`/booking/${booking.id}`);
  };

  const handleSignOut = () => {
    // Sign out functionality will be implemented here
    console.log("Sign out clicked");
  };

  // Mock user name - this would come from authentication context
  const userName = "Manuth";

  if (loading) {
    return (
      <div className="dashboard-page">
        <MainNav />
        <header className="dashboard-header">
          <div className="dashboard-header-container">
            <div className="dashboard-header-left">
              <h1 className="dashboard-header-title">Artist Manager Dashboard</h1>
              <p className="dashboard-welcome-message">
                Welcome back, {userName}! Manage your artists and applications efficiently.
              </p>
            </div>
            <button className="dashboard-signout-btn" onClick={handleSignOut}>
              <svg
                className="signout-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16,17 21,12 16,7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </header>
        <ArtistManagerNav />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <MainNav />

      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-container">
          <div className="dashboard-header-left">
            <h1 className="dashboard-header-title">Artist Manager Dashboard</h1>
            <p className="dashboard-welcome-message">
              Welcome back, {userName}! Manage your artists and applications efficiently.
            </p>
          </div>
          <button className="dashboard-signout-btn" onClick={handleSignOut}>
            <svg
              className="signout-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <ArtistManagerNav />

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <div className="error-container">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button className="error-dismiss" onClick={() => setError(null)}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <main className="dashboard-content">
        <div className="dashboard-container">
          {/* Overview Cards Section */}
          <section className="overview-section">
            <div className="section-header">
              <h2 className="section-title">Overview</h2>
              <p className="section-description">
                Key metrics and performance indicators for your artist management
              </p>
            </div>
            
            <div className="overview-cards">
              <OverviewCard
                title="Total Revenue"
                value={`$${overviewData.totalRevenue.toLocaleString()}`}
                description="Sum of all booking payments"
                icon="💰"
                color="green"
              />
              <OverviewCard
                title="Total Artists"
                value={overviewData.totalArtists}
                description="Registered artists count"
                icon="🎨"
                color="blue"
              />
              <OverviewCard
                title="Pending"
                value={overviewData.pending}
                description="Bookings awaiting approval"
                icon="⏳"
                color="orange"
              />
              <OverviewCard
                title="Rejected"
                value={overviewData.rejected}
                description="Declined bookings"
                icon="❌"
                color="red"
              />
            </div>
          </section>

          {/* Recent Bookings Section */}
          <section className="bookings-section">
            <div className="section-header">
              <h2 className="section-title">Recent Bookings</h2>
              <p className="section-description">
                Latest booking requests and their current status
              </p>
              <button className="generate-report-btn" onClick={generateReport}>
                Generate Report
              </button>
            </div>

            <div className="bookings-table-container">
              {recentBookings.length > 0 ? (
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Artist Booked</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="booking-row"
                        onClick={() => handleBookingClick(booking)}
                      >
                        <td>{booking.customer}</td>
                        <td>{booking.artistBooked}</td>
                        <td>{new Date(booking.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="delete-booking-btn"
                            onClick={(e) => handleDeleteBooking(booking.id, e)}
                            title="Delete booking record"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-bookings">
                  <p>No recent bookings found.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Overview;
