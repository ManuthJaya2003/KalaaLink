import React, { useEffect, useState } from "react";
import MainNav from "../../MainNav/MainNav";
import ArtistNav from "../ArtistNav/ArtistNav.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LocationModal from "../../Common/LocationModal";
import "./ArtistDashboard.css";

function ArtistDashboard() {
  const [artist, setArtist] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [postponedBookings, setPostponedBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showPostponed, setShowPostponed] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const navigate = useNavigate();

  // Form state for edit profile
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    stageName: "",
    bookingPrice: "",
    bio: ""
  });
  const [message, setMessage] = useState("");

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem("artist");
    navigate("/login");
  };

  // Open Edit Profile Modal
  const handleEditProfile = () => {
    setEditForm({
      firstName: artist.firstName || "",
      lastName: artist.lastName || "",
      stageName: artist.stageName || "",
      bookingPrice: artist.bookingPrice || "",
      bio: artist.bio || ""
    });
    setShowEditModal(true);
  };

  // Close Edit Profile Modal
  const handleCloseModal = () => {
    setShowEditModal(false);
    setMessage("");
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!artist || (!artist.id && !artist._id)) return;

    const artistId = artist.id || artist._id;

    try {
      console.log('Sending update request with data:', editForm);
      console.log('Artist ID being used:', artistId);
      
      const res = await axios.put(
        `http://localhost:5000/registeredArtists/${artistId}`,
        editForm
      );

      console.log('Update response:', res.data);
      const updatedArtist = res.data.artist;
      // Ensure we have both id and _id for consistency
      updatedArtist.id = updatedArtist._id || updatedArtist.id;
      setArtist(updatedArtist);

      // Update localStorage
      localStorage.setItem(
        "artist",
        JSON.stringify({
          ...updatedArtist,
          id: updatedArtist.id || updatedArtist._id,
        })
      );

      setMessage("Profile updated successfully!");
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile. Try again.");
    }
  };

    // Handle Delete Profile
  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile? This cannot be undone.")) return;

    if (!artist || (!artist.id && !artist._id)) return;
    const artistId = artist.id || artist._id;

    try {
      await axios.delete(`http://localhost:5000/registeredArtists/${artistId}`);
      localStorage.removeItem("artist");
      alert("Your profile has been deleted successfully.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to delete profile. Please try again.");
    }
  };

  // Generate PDF Report
  const generatePDFReport = async () => {
    setGeneratingReport(true);
    try {
      const doc = new jsPDF();
      
      // Header with logo placeholder
      doc.setFontSize(28);
      doc.setTextColor(30, 58, 138); // Blue color
      doc.text("🎵 KalaaLink", 105, 25, { align: "center" });
      
      doc.setFontSize(20);
      doc.text("Artist Performance Report", 105, 40, { align: "center" });
      
      // Subtitle
      doc.setFontSize(14);
      doc.setTextColor(107, 114, 128); // Gray color
      doc.text("Comprehensive Analytics & Insights", 105, 55, { align: "center" });
      
      // Timestamp
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 70, { align: "center" });
      
      // Artist Information Section
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text("👤 Artist Profile", 20, 95);
      
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      doc.text(`Full Name: ${artist.firstName} ${artist.lastName}`, 20, 110);
      doc.text(`Stage Name: ${artist.stageName || "Not specified"}`, 20, 125);
      doc.text(`Email: ${artist.email || "Not specified"}`, 20, 140);
      doc.text(`Booking Price: $${artist.bookingPrice || 0}`, 20, 155);
      
      // Bio section (with word wrapping)
      const bioText = artist.bio || "No bio available";
      const splitBio = doc.splitTextToSize(bioText, 170);
      doc.text("Bio:", 20, 170);
      doc.text(splitBio, 20, 180);
      
      // Revenue Statistics
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text("💰 Revenue Overview", 20, 210);
      
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129); // Green color for revenue
      doc.text(`Total Revenue: $${totalRevenue.toLocaleString()}`, 20, 230);
      
      // Calculate additional revenue metrics
      const paidBookings = bookings.filter(booking => booking.paymentStatus === "paid");
      const pendingBookings = bookings.filter(booking => booking.paymentStatus === "pending");
      const potentialRevenue = pendingBookings.length * (artist.bookingPrice || 0);
      
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      doc.text(`Paid Bookings: ${paidBookings.length}`, 20, 245);
      doc.text(`Pending Payments: ${pendingBookings.length}`, 20, 255);
      doc.text(`Potential Revenue: $${potentialRevenue.toLocaleString()}`, 20, 265);
      
      // Booking Statistics
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text("📊 Booking Statistics", 20, 290);
      
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      doc.text(`Total Bookings: ${bookings.length}`, 20, 305);
      doc.text(`Upcoming Bookings: ${upcomingBookings.length}`, 20, 315);
      doc.text(`Completed Bookings: ${completedBookings.length}`, 20, 325);
      doc.text(`Postponed Bookings: ${postponedBookings.length}`, 20, 335);
      doc.text(`Cancelled Bookings: ${cancelledBookings.length}`, 20, 345);
      
      // Calculate completion rate
      const completionRate = bookings.length > 0 ? ((completedBookings.length / bookings.length) * 100).toFixed(1) : 0;
      doc.setTextColor(16, 185, 129);
      doc.text(`Completion Rate: ${completionRate}%`, 20, 355);
      
      // Recent Bookings Table
      if (bookings.length > 0) {
        doc.addPage();
        
        doc.setFontSize(16);
        doc.setTextColor(17, 24, 39);
        doc.text("📅 Recent Bookings", 20, 25);
        
        const tableData = bookings.slice(0, 15).map(booking => [
          booking.customerName || "N/A",
          booking.eventType || "N/A",
          new Date(booking.eventDate).toLocaleDateString(),
          booking.eventVenue || "N/A",
          booking.status || "upcoming",
          booking.paymentStatus || "pending"
        ]);
        
        autoTable(doc, {
          head: [["Customer", "Event Type", "Date", "Venue", "Status", "Payment"]],
          body: tableData,
          startY: 35,
          styles: {
            fontSize: 9,
            cellPadding: 3
          },
          headStyles: {
            fillColor: [139, 92, 246], // Purple color
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          columnStyles: {
            0: { cellWidth: 35 }, // Customer name
            1: { cellWidth: 30 }, // Event type
            2: { cellWidth: 25 }, // Date
            3: { cellWidth: 35 }, // Venue
            4: { cellWidth: 25 }, // Status
            5: { cellWidth: 25 }  // Payment
          }
        });
      }
      
      // Summary and Insights
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text("💡 Key Insights", 20, doc.lastAutoTable.finalY + 20);
      
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      
      let insightsY = doc.lastAutoTable.finalY + 35;
      
      if (totalRevenue > 0) {
        doc.text(`• Total earnings: $${totalRevenue.toLocaleString()}`, 20, insightsY);
        insightsY += 10;
      }
      
      if (upcomingBookings.length > 0) {
        doc.text(`• ${upcomingBookings.length} upcoming events scheduled`, 20, insightsY);
        insightsY += 10;
      }
      
      if (completionRate > 50) {
        doc.text(`• High completion rate of ${completionRate}%`, 20, insightsY);
        insightsY += 10;
      }
      
      if (pendingBookings.length > 0) {
        doc.text(`• ${pendingBookings.length} pending payments worth $${potentialRevenue.toLocaleString()}`, 20, insightsY);
        insightsY += 10;
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: "center" });
        doc.text("KalaaLink Artist Management System", 105, doc.internal.pageSize.height - 5, { align: "center" });
      }
      
      // Save the PDF
      const fileName = `KalaaLink_Artist_Report_${artist.firstName}_${artist.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      alert("PDF report generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Handle opening/closing the action menu
  const toggleActionMenu = (bookingId) => {
    setOpenMenuId(openMenuId === bookingId ? null : bookingId);
  };

  // Close menu when clicking outside
  const closeActionMenu = () => {
    setOpenMenuId(null);
  };

  // Handle booking status updates
  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      // Update the booking status in the backend
      const response = await axios.put(`http://localhost:5000/bookings/${bookingId}/status`, {
        status: newStatus
      });

      console.log('Status update response:', response.data);

      // Update local state
      const updatedBookings = bookings.map(booking => 
        booking._id === bookingId || booking.id === bookingId
          ? { ...booking, status: newStatus }
          : booking
      );

      setBookings(updatedBookings);

      // Re-categorize bookings
      categorizeBookings(updatedBookings);

      // Show success message
      alert(`Booking ${newStatus} successfully!`);
      
      // Close the menu
      setOpenMenuId(null);
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status. Please try again.');
    }
  };

  const handleGetDirections = (booking) => {
    setSelectedBooking(booking);
    setIsLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
    setSelectedBooking(null);
  };

  // Categorize bookings by status
  const categorizeBookings = (allBookings) => {
    const now = new Date();
    
    const upcoming = allBookings.filter(booking => 
      new Date(booking.eventDate) > now && 
      (!booking.status || booking.status === 'upcoming' || booking.status === 'confirmed')
    );
    
    const completed = allBookings.filter(booking => 
      (new Date(booking.eventDate) <= now && (!booking.status || booking.status === 'completed')) ||
      booking.status === 'completed'
    );
    
    const postponed = allBookings.filter(booking => 
      booking.status === 'postponed'
    );
    
    const cancelled = allBookings.filter(booking => 
      booking.status === 'cancelled'
    );

    setUpcomingBookings(upcoming);
    setCompletedBookings(completed);
    setPostponedBookings(postponed);
    setCancelledBookings(cancelled);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Fetch artist info and bookings on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedArtist = JSON.parse(localStorage.getItem("artist"));
        if (!storedArtist) {
          navigate("/login");
          return;
        }

        // Fetch artist profile
        console.log('Stored artist data:', storedArtist);
        const artistId = storedArtist.id || storedArtist._id;
        console.log('Artist ID being used:', artistId);
        
        const artistRes = await axios.get(`http://localhost:5000/registeredArtists/${artistId}`);
        const artistData = artistRes.data.artist;
        // Ensure we have both id and _id for consistency
        artistData.id = artistData._id || artistData.id;
        setArtist(artistData);

        // Fetch artist bookings
        const bookingsRes = await axios.get(`http://localhost:5000/bookings`);
        if (bookingsRes.data && bookingsRes.data.artistBookings) {
          const allBookings = bookingsRes.data.artistBookings;
          const artistBookings = allBookings.filter(booking => 
            booking.artist && (booking.artist.id === storedArtist.id || booking.artist._id === storedArtist.id)
          );
          
          setBookings(artistBookings);
          
          // Calculate total revenue
          const revenue = artistBookings
            .filter(booking => booking.paymentStatus === "paid")
            .reduce((sum, booking) => sum + (artistData.bookingPrice || 0), 0);
          setTotalRevenue(revenue);

          // Categorize bookings by status
          categorizeBookings(artistBookings);
        }
      } catch (err) {
        console.error('Error fetching artist data:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <MainNav />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!artist) return <p>Loading...</p>;

  return (
    <div className="dashboard-page">
      <MainNav />

      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-container">
          <div className="dashboard-header-left">
            <h1 className="dashboard-header-title">
              <span className="dashboard-icon">👤</span>
              Artist Dashboard
            </h1>
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

      {/* Artist Navigation */}
      <ArtistNav />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Left Column - Artist Profile Card */}
          <div className="profile-card">
            <div className="profile-picture">
              <div className="profile-placeholder">
                100 x 100
              </div>
            </div>
            <h2 className="artist-name">{artist.firstName} {artist.lastName}</h2>
            <p className="artist-genre">{artist.stageName || "Indie Soul"}</p>
            
            <div className="profile-actions">
              <button className="edit-profile-btn" onClick={handleEditProfile}>
                <span className="btn-icon">✏️</span>
                Edit Profile
              </button>
                             <button 
                 className={`generate-report-btn ${generatingReport ? 'loading' : ''}`} 
                 onClick={generatePDFReport}
                 disabled={generatingReport}
               >
                 <span className="btn-icon">
                   {generatingReport ? '⏳' : '📄'}
                 </span>
                 {generatingReport ? 'Generating...' : 'Generate Report'}
               </button>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="main-content">
            {/* Total Revenue Flashcard */}
            <div className="revenue-card">
              <h3 className="card-title">$ Total Revenue</h3>
              <div className="card-value">${totalRevenue.toLocaleString()}</div>
              <p className="card-description">This is your total earnings to date.</p>
            </div>

            {/* Manage Bookings Section */}
            <div className="bookings-section">
              <h3 className="section-title">Manage Bookings</h3>
              <p className="section-description">View and manage all your event bookings.</p>
              
              {/* Upcoming Bookings */}
              <div className="bookings-group">
                <div 
                  className="bookings-header"
                  onClick={() => setShowUpcoming(!showUpcoming)}
                >
                  <span className="header-icon">📅</span>
                  <span className="header-text">Upcoming Bookings {upcomingBookings.length}</span>
                  <span className={`header-chevron ${showUpcoming ? 'up' : 'down'}`}>
                    {showUpcoming ? '▲' : '▼'}
                  </span>
                </div>
                
                {showUpcoming && (
                  <div className="bookings-list">
                    {upcomingBookings.length === 0 ? (
                      <p className="no-bookings">No upcoming bookings</p>
                    ) : (
                      upcomingBookings.map((booking, index) => (
                        <div key={index} className="booking-item">
                          <div className="booking-info">
                            <div className="booking-title">
                              {artist.firstName} {artist.lastName}: {booking.eventType || 'Live Performance'}
                            </div>
                            <div className="booking-details">
                              <span className="booking-location">
                                📍 {booking.eventVenue || 'Venue TBD'}
                              </span>
                              <span className="booking-date">
                                ({new Date(booking.eventDate).toLocaleDateString()})
                              </span>
                            </div>
                          </div>
                          <div className="booking-actions">
                            <div className="action-menu">
                              <span 
                                className="action-dots" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleActionMenu(booking._id || booking.id);
                                }}
                              >
                                ⋯
                              </span>
                              {openMenuId === (booking._id || booking.id) && (
                                <div className="action-dropdown">
                                  <button 
                                    className="action-option"
                                    onClick={() => handleGetDirections(booking)}
                                  >
                                    <span className="action-icon">🗺️</span>
                                    Get Directions
                                  </button>
                                  <button 
                                    className="action-option"
                                    onClick={() => handleBookingStatusUpdate(booking._id || booking.id, 'completed')}
                                  >
                                    <span className="action-icon">✅</span>
                                    Mark as Completed
                                  </button>
                                  <button 
                                    className="action-option"
                                    onClick={() => handleBookingStatusUpdate(booking._id || booking.id, 'postponed')}
                                  >
                                    <span className="action-icon">⏰</span>
                                    Mark as Postponed
                                  </button>
                                  <button 
                                    className="action-option delete"
                                    onClick={() => handleBookingStatusUpdate(booking._id || booking.id, 'cancelled')}
                                  >
                                    <span className="action-icon">❌</span>
                                    Cancel Booking
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Completed Bookings */}
              <div className="bookings-group">
                <div 
                  className="bookings-header"
                  onClick={() => setShowCompleted(!showCompleted)}
                >
                  <span className="header-icon">✅</span>
                  <span className="header-text">Completed Bookings {completedBookings.length}</span>
                  <span className={`header-chevron ${showCompleted ? 'up' : 'down'}`}>
                    {showCompleted ? '▲' : '▼'}
                  </span>
                </div>
                
                {showCompleted && (
                  <div className="bookings-list">
                    {completedBookings.length === 0 ? (
                      <p className="no-bookings">No completed bookings</p>
                    ) : (
                                             completedBookings.map((booking, index) => (
                         <div key={index} className="booking-item">
                           <div className="booking-info">
                             <div className="booking-title">
                               {artist.firstName} {artist.lastName}: {booking.eventType || 'Live Performance'}
                             </div>
                             <div className="booking-details">
                               <span className="booking-location">
                                 📍 {booking.eventVenue || 'Venue TBD'}
                               </span>
                               <span className="booking-date">
                                 ({new Date(booking.eventDate).toLocaleDateString()})
                               </span>
                             </div>
                           </div>
                           <div className="booking-actions">
                             <div className="action-menu">
                               <span 
                                 className="action-dots" 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   toggleActionMenu(booking._id || booking.id);
                                 }}
                               >
                                 ⋯
                               </span>
                               {openMenuId === (booking._id || booking.id) && (
                                 <div className="action-dropdown">
                                   <button 
                                     className="action-option"
                                     onClick={() => handleBookingStatusUpdate(booking._id || booking.id, 'completed')}
                                   >
                                     <span className="action-icon">✅</span>
                                     Mark as Completed
                                   </button>
                                   <button 
                                     className="action-option"
                                     onClick={() => handleBookingStatusUpdate(booking._id || booking.id, 'postponed')}
                                   >
                                     <span className="action-icon">⏰</span>
                                     Mark as Postponed
                                   </button>
                                   <button 
                                     className="action-option delete"
                                     onClick={() => handleBookingStatusUpdate(booking._id || booking.id, 'cancelled')}
                                   >
                                     <span className="action-icon">❌</span>
                                     Cancel Booking
                                   </button>
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>
                       ))
                    )}
                  </div>
                )}
              </div>

              {/* Postponed Bookings */}
              <div className="bookings-group">
                <div 
                  className="bookings-header"
                  onClick={() => setShowPostponed(!showPostponed)}
                >
                  <span className="header-icon">⏰</span>
                  <span className="header-text">Postponed Bookings {postponedBookings.length}</span>
                  <span className={`header-chevron ${showPostponed ? 'up' : 'down'}`}>
                    {showPostponed ? '▲' : '▼'}
                  </span>
                </div>
                
                {showPostponed && (
                  <div className="bookings-list">
                    {postponedBookings.length === 0 ? (
                      <p className="no-bookings">No postponed bookings</p>
                    ) : (
                                             postponedBookings.map((booking, index) => (
                         <div key={index} className="booking-item">
                           <div className="booking-info">
                             <div className="booking-title">
                               {artist.firstName} {artist.lastName}: {booking.eventType || 'Live Performance'}
                             </div>
                             <div className="booking-details">
                               <span className="booking-location">
                                 📍 {booking.eventVenue || 'Venue TBD'}
                               </span>
                               <span className="booking-date">
                                 ({new Date(booking.eventDate).toLocaleDateString()})
                               </span>
                             </div>
                           </div>
                           <div className="booking-actions">
                             <div className="action-menu">
                               <span 
                                 className="action-dots" 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   toggleActionMenu(booking._id || booking.id);
                                 }}
                               >
                                 ⋯
                               </span>
                               {openMenuId === (booking._id || booking.id) && (
                                 <div className="action-dropdown">
                                   <button 
                                     className="action-option"
                                     onClick={() => handleBookingStatusUpdate(booking._id || booking.id, 'completed')}
                                   >
                                     <span className="action-icon">✅</span>
                                     Mark as Completed
                                   </button>
                                   <button 
                                     className="action-option"
                                     onClick={() => handleBookingStatusUpdate(booking._id || booking.id, 'upcoming')}
                                   >
                                     <span className="action-icon">📅</span>
                                     Mark as Upcoming
                                   </button>
                                   <button 
                                     className="action-option delete"
                                     onClick={() => handleBookingStatusUpdate(booking._id || booking.id, 'cancelled')}
                                   >
                                     <span className="action-icon">❌</span>
                                     Cancel Booking
                                   </button>
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>
                       ))
                    )}
                  </div>
                )}
              </div>

              {/* Cancelled Bookings */}
              <div className="bookings-group">
                <div 
                  className="bookings-header"
                  onClick={() => setShowCancelled(!showCancelled)}
                >
                  <span className="header-icon">❌</span>
                  <span className="header-text">Cancelled Bookings {cancelledBookings.length}</span>
                  <span className={`header-chevron ${showCancelled ? 'up' : 'down'}`}>
                    {showCancelled ? '▲' : '▼'}
                  </span>
                </div>
                
                {showCancelled && (
                  <div className="bookings-list">
                    {cancelledBookings.length === 0 ? (
                      <p className="no-bookings">No cancelled bookings</p>
                    ) : (
                                             cancelledBookings.map((booking, index) => (
                         <div key={index} className="booking-item">
                           <div className="booking-info">
                             <div className="booking-title">
                               {artist.firstName} {artist.lastName}: {booking.eventType || 'Live Performance'}
                             </div>
                             <div className="booking-details">
                               <span className="booking-location">
                                 📍 {booking.eventVenue || 'Venue TBD'}
                               </span>
                               <span className="booking-date">
                                 ({new Date(booking.eventDate).toLocaleDateString()})
                               </span>
                             </div>
                           </div>
                           <div className="booking-actions">
                             <div className="action-menu">
                               <span 
                                 className="action-dots" 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   toggleActionMenu(booking._id || booking.id);
                                 }}
                               >
                                 ⋯
                               </span>
                               {openMenuId === (booking._id || booking.id) && (
                                 <div className="action-dropdown">
                                   <button 
                                     className="action-option"
                                     onClick={() => handleBookingStatusUpdate(booking._id || booking.id, 'upcoming')}
                                   >
                                     <span className="action-icon">📅</span>
                                     Mark as Upcoming
                                   </button>
                                   <button 
                                     className="action-option"
                                     onClick={() => handleBookingStatusUpdate(booking._id || booking.id, 'postponed')}
                                   >
                                     <span className="action-icon">⏰</span>
                                     Mark as Postponed
                                   </button>
                                   <button 
                                     className="action-option"
                                     onClick={() => handleBookingStatusUpdate(booking._id || booking.id, 'completed')}
                                   >
                                     <span className="action-icon">✅</span>
                                     Mark as Completed
                                   </button>
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>
                       ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            {message && (
              <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="edit-form">
              <div className="form-group">
                <label htmlFor="firstName">First Name:</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name:</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stageName">Stage Name:</label>
                <input
                  type="text"
                  id="stageName"
                  name="stageName"
                  value={editForm.stageName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bookingPrice">Booking Price ($):</label>
                <input
                  type="number"
                  id="bookingPrice"
                  name="bookingPrice"
                  value={editForm.bookingPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio:</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
        booking={selectedBooking}
        title="Get Directions to Venue"
      />
    </div>
  );
}

export default ArtistDashboard;
