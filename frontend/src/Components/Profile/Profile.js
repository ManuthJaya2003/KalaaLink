import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '../MainNav/MainNav';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Profile.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Profile() {
  const { user, isAuthenticated, logout, deleteProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [artistBookings, setArtistBookings] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Edit profile states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Map and real-time states
  const [expandedMaps, setExpandedMaps] = useState({});
  const [artistLocations, setArtistLocations] = useState({});
  const [userLocation, setUserLocation] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
      getUserLocation();
    }
  }, [isAuthenticated]);

  // Real-time updates for bookings
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchUserData();
        fetchArtistLocations();
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting user location:', error);
        }
      );
    }
  };

  // Fetch artist locations from backend API
  const fetchArtistLocations = async () => {
    try {
      const upcomingBookings = artistBookings.filter(
        booking => booking.status === 'upcoming' && booking.eventLocation
      );
      
      if (upcomingBookings.length === 0) return;

      const bookingIds = upcomingBookings.map(booking => booking._id);
      
      const response = await axios.post('http://localhost:5000/api/location/artist-locations', {
        bookingIds
      });

      if (response.data.success) {
        setArtistLocations(response.data.locations);
      }
    } catch (error) {
      console.error('Error fetching artist locations:', error);
      // Fallback to simulated data if API fails
      const locations = {};
      artistBookings.forEach(booking => {
        if (booking.status === 'upcoming' && booking.eventLocation) {
          locations[booking._id] = {
            lat: booking.eventLocation.lat + (Math.random() - 0.5) * 0.01,
            lng: booking.eventLocation.lng + (Math.random() - 0.5) * 0.01,
            lastUpdated: new Date(),
            status: 'simulated'
          };
        }
      });
      setArtistLocations(locations);
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch artist bookings, event bookings, orders, and donations in parallel
      const [artistBookingsRes, eventBookingsRes, ordersRes, donationsRes] = await Promise.allSettled([
        axios.get('http://localhost:5000/bookings'),
        axios.get('http://localhost:5000/eventBookings'),
        axios.get('http://localhost:5000/api/orders'),
        axios.get('http://localhost:5000/donor')
      ]);

      if (artistBookingsRes.status === 'fulfilled') {
        // Filter artist bookings for current user
        const responseData = artistBookingsRes.value.data;
        const bookingsArray = responseData.artistBookings || responseData.bookings || responseData || [];
        const userArtistBookings = Array.isArray(bookingsArray) ? bookingsArray.filter(
          booking => booking.customerEmail === user?.email
        ) : [];
        setArtistBookings(userArtistBookings);
      } else {
        console.error('Artist bookings request failed:', artistBookingsRes.reason);
        setArtistBookings([]);
      }

      if (eventBookingsRes.status === 'fulfilled') {
        // Filter event bookings for current user
        const responseData = eventBookingsRes.value.data;
        const bookingsArray = responseData.bookings || responseData || [];
        const userEventBookings = Array.isArray(bookingsArray) ? bookingsArray.filter(
          booking => booking.customerEmail === user?.email
        ) : [];
        setEventBookings(userEventBookings);
      } else {
        console.error('Event bookings request failed:', eventBookingsRes.reason);
        setEventBookings([]);
      }

      if (ordersRes.status === 'fulfilled') {
        // Filter orders for current user
        const ordersData = ordersRes.value.data;
        const ordersArray = Array.isArray(ordersData) ? ordersData : [];
        const userOrders = ordersArray.filter(
          order => order.customerEmail === user?.email
        );
        setOrders(userOrders);
      } else {
        console.error('Orders request failed:', ordersRes.reason);
        setOrders([]);
      }

      if (donationsRes.status === 'fulfilled') {
        // Filter donations for current user
        const responseData = donationsRes.value.data;
        const donationsArray = responseData.donors || responseData.donations || responseData || [];
        const userDonations = Array.isArray(donationsArray) ? donationsArray.filter(
          donation => donation.donorEmail === user?.email || donation.Email === user?.email
        ) : [];
        setDonations(userDonations);
        console.log(`Found ${userDonations.length} donations for user ${user?.email}`);
      } else {
        console.error('Donations request failed:', donationsRes.reason);
        // Set empty array if donations request fails
        setDonations([]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMemberSince = () => {
    if (user?.createdAt) {
      return formatDate(user.createdAt);
    }
    return 'Recently joined';
  };

  const generateActivityPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Set up colors
    const primaryColor = [39, 174, 96]; // Green
    const secondaryColor = [44, 62, 80]; // Dark blue
    const lightGray = [245, 247, 250];
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('KalaaLink - My Activity Report', 20, 20);
    
    // User info section
    let yPosition = 50;
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Profile Information', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${user.firstName} ${user.lastName}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Email: ${user.email}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Role: ${user.role}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Member Since: ${getMemberSince()}`, 20, yPosition);
    
    yPosition += 20;
    
    // Bookings section
    const totalBookings = artistBookings.length + eventBookings.length;
    if (totalBookings > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Booking History', 20, yPosition);
      yPosition += 10;
      
      // Artist Bookings
      if (artistBookings.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Artist Bookings', 20, yPosition);
        yPosition += 8;
        
        const artistBookingData = artistBookings.map((booking, index) => [
          index + 1,
          booking.artist?.stageName || booking.artist?.artistName || (booking.artist?.firstName && booking.artist?.lastName ? `${booking.artist.firstName} ${booking.artist.lastName}` : booking.artist?.firstName || booking.artist?.lastName || 'Artist Booking'),
          booking.eventType,
          formatDate(booking.eventDate),
          booking.status,
          booking.paymentStatus
        ]);
        
        doc.autoTable({
          startY: yPosition,
          head: [['#', 'Artist', 'Event Type', 'Date', 'Status', 'Payment']],
          body: artistBookingData,
          theme: 'grid',
          headStyles: { fillColor: [52, 152, 219] },
          margin: { left: 20, right: 20 }
        });
        
        yPosition = doc.lastAutoTable.finalY + 10;
      }
      
      // Event Bookings
      if (eventBookings.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Event Bookings', 20, yPosition);
        yPosition += 8;
        
        const eventBookingData = eventBookings.map((booking, index) => [
          index + 1,
          booking.event?.eventTitle || booking.event?.name || 'Event Booking',
          formatDate(booking.bookingDate),
          booking.ticketsBooked + ' ticket(s)',
          booking.status,
          booking.paymentIntentId ? booking.paymentIntentId.slice(-8) : 'N/A'
        ]);
        
        doc.autoTable({
          startY: yPosition,
          head: [['#', 'Event', 'Date', 'Tickets', 'Status', 'Payment ID']],
          body: eventBookingData,
          theme: 'grid',
          headStyles: { fillColor: [46, 204, 113] },
          margin: { left: 20, right: 20 }
        });
        
        yPosition = doc.lastAutoTable.finalY + 10;
      }
      
      yPosition += 20;
    }
    
    // Orders section
    if (orders.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Order History', 20, yPosition);
      yPosition += 10;
      
      const orderData = orders.map((order, index) => [
        index + 1,
        `Order #${order._id?.slice(-8) || index + 1}`,
        formatDate(order.createdAt),
        order.status || 'Processing',
        `LKR ${order.totalAmount || '0.00'}`
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [['#', 'Order ID', 'Date', 'Status', 'Total']],
        body: orderData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: lightGray },
        margin: { left: 20, right: 20 }
      });
      
      yPosition = doc.lastAutoTable.finalY + 20;
    }
    
    // Donations section
    if (donations.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Donation History', 20, yPosition);
      yPosition += 10;
      
      const donationData = donations.map((donation, index) => [
        index + 1,
        donation.packageName || 'Donation',
        formatDate(donation.createdAt || donation.Date),
        donation.paymentStatus || donation.status || 'Completed',
        `LKR ${donation.Amount || donation.amount || '0.00'}`
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [['#', 'Package', 'Date', 'Status', 'Amount']],
        body: donationData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: lightGray },
        margin: { left: 20, right: 20 }
      });
    }
    
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 40, pageHeight - 10);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, pageHeight - 10);
    }
    
    // Download the PDF
    const fileName = `KalaaLink_Activity_Report_${user.firstName}_${user.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const handleDeleteProfile = async () => {
    setDeleting(true);
    try {
      const result = await deleteProfile();
      if (result.success) {
        // Profile deleted successfully, redirect to home
        navigate('/mainhome');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert('An unexpected error occurred while deleting your profile.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Edit profile functions
  const openEditModal = () => {
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditErrors({});
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditFormData({ firstName: '', lastName: '', email: '', password: '' });
    setSelectedImage(null);
    setImagePreview(null);
    setEditErrors({});
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (editErrors[name]) {
      setEditErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setEditErrors(prev => ({
          ...prev,
          profilePicture: 'Please select a valid image file (JPEG, PNG, or GIF)'
        }));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setEditErrors(prev => ({
          ...prev,
          profilePicture: 'Image size must be less than 5MB'
        }));
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (editErrors.profilePicture) {
        setEditErrors(prev => ({
          ...prev,
          profilePicture: ''
        }));
      }
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (editFormData.firstName.trim() === '') {
      errors.firstName = 'First name is required';
    }

    if (editFormData.lastName.trim() === '') {
      errors.lastName = 'Last name is required';
    }

    if (editFormData.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (editFormData.password.trim() !== '' && editFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }

    setEditing(true);
    try {
      const result = await updateProfile(editFormData, selectedImage);
      
      if (result.success) {
        showNotification('Profile updated successfully!', 'success');
        closeEditModal();
      } else {
        showNotification(result.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showNotification('An unexpected error occurred', 'error');
    } finally {
      setEditing(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  // Map utility functions
  const toggleMap = (bookingId) => {
    setExpandedMaps(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const getDirectionsUrl = (destination) => {
    if (!userLocation) return null;
    return `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${destination.lat},${destination.lng}`;
  };

  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    // Handle different path formats
    if (profilePicture.startsWith('http')) {
      return profilePicture; // Already a full URL
    }
    if (profilePicture.startsWith('/uploads/')) {
      return `http://localhost:5000${profilePicture}`;
    }
    if (profilePicture.startsWith('uploads/')) {
      return `http://localhost:5000/${profilePicture}`;
    }
    return `http://localhost:5000/uploads/${profilePicture}`;
  };

  // Map component for artist bookings
  const ArtistBookingMap = ({ booking }) => {
    const artistLocation = artistLocations[booking._id];
    const eventLocation = booking.eventLocation;

    if (!eventLocation) return <p>Location not available</p>;

    return (
      <div className="booking-map">
        <MapContainer
          center={[eventLocation.lat, eventLocation.lng]}
          zoom={13}
          style={{ height: '300px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Event location marker */}
          <Marker position={[eventLocation.lat, eventLocation.lng]}>
            <Popup>
              <div>
                <strong>Event Location</strong><br />
                {booking.eventVenue}<br />
                <small>Event Date: {formatDate(booking.eventDate)}</small>
              </div>
            </Popup>
          </Marker>

          {/* Artist location marker (if available) */}
          {artistLocation && (
            <Marker position={[artistLocation.lat, artistLocation.lng]}>
              <Popup>
                <div>
                  <strong>Artist Location</strong><br />
                  <small>Last updated: {artistLocation.lastUpdated.toLocaleTimeString()}</small>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
        
        {userLocation && (
          <div className="map-actions">
            <a
              href={getDirectionsUrl(eventLocation)}
              target="_blank"
              rel="noopener noreferrer"
              className="directions-btn"
            >
              📍 Get Directions
            </a>
          </div>
        )}
      </div>
    );
  };

  // Map component for event bookings
  const EventBookingMap = ({ booking }) => {
    if (!booking.event) return <p>Event information not available</p>;

    const venueLocation = booking.event.venueCoordinates ? 
      { lat: booking.event.venueCoordinates.latitude, lng: booking.event.venueCoordinates.longitude } :
      booking.event.venue?.location || { lat: 0, lng: 0 };

    return (
      <div className="booking-map">
        <MapContainer
          center={[venueLocation.lat, venueLocation.lng]}
          zoom={13}
          style={{ height: '300px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <Marker position={[venueLocation.lat, venueLocation.lng]}>
            <Popup>
              <div>
                <strong>{booking.event.eventTitle || booking.event.name}</strong><br />
                {booking.event.eventVenue || booking.event.venue?.name}<br />
                <small>Event Date: {formatDate(booking.event.eventDate || booking.event.date)}</small>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
        
        {userLocation && (
          <div className="map-actions">
            <a
              href={getDirectionsUrl(venueLocation)}
              target="_blank"
              rel="noopener noreferrer"
              className="directions-btn"
            >
              📍 Get Directions
            </a>
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }


  return (
    <div>
      <MainNav />
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
        </div>

        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar">
              {user.profilePicture ? (
                <img 
                  src={getProfilePictureUrl(user.profilePicture)} 
                  alt="Profile" 
                  onError={(e) => {
                    console.error('Profile picture failed to load:', e.target.src);
                    e.target.style.display = 'none';
                    e.target.parentNode.querySelector('.default-avatar').style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="default-avatar" style={{ display: user.profilePicture ? 'none' : 'flex' }}>
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
            </div>
            <div className="profile-info">
              <h2>{user.firstName} {user.lastName}</h2>
              <p className="profile-email">{user.email}</p>
              <p className="profile-role">Role: {user.role}</p>
              <p className="profile-member-since">Member since: {getMemberSince()}</p>
              
              {/* Action Buttons */}
              <div className="profile-actions">
                <button 
                  className="edit-profile-btn"
                  onClick={openEditModal}
                  title="Edit your profile information"
                >
                  ✏️ Edit Profile
                </button>
                
                <button 
                  className="download-pdf-btn"
                  onClick={generateActivityPDF}
                  title="Download your activity report as PDF"
                >
                  📄 Download My Activity PDF
                </button>
                
                <button 
                  className="delete-profile-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete your profile permanently"
                >
                  🗑️ Delete Profile
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            <div className="tab-buttons">
              <button
                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button
                className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                Booking History ({artistBookings.length + eventBookings.length})
              </button>
              <button
                className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Order History ({orders.length})
              </button>
              <button
                className={`tab-button ${activeTab === 'donations' ? 'active' : ''}`}
                onClick={() => setActiveTab('donations')}
              >
                Donations ({donations.length})
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'profile' && (
                <div className="profile-details">
                  <h3>Profile Information</h3>
                  <div className="profile-field">
                    <label>First Name:</label>
                    <span>{user.firstName}</span>
                  </div>
                  <div className="profile-field">
                    <label>Last Name:</label>
                    <span>{user.lastName}</span>
                  </div>
                  <div className="profile-field">
                    <label>Email:</label>
                    <span>{user.email}</span>
                  </div>
                  <div className="profile-field">
                    <label>Role:</label>
                    <span>{user.role}</span>
                  </div>
                  <div className="profile-field">
                    <label>Member Since:</label>
                    <span>{getMemberSince()}</span>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="bookings-history">
                  <h3>Booking History</h3>
                  {loading ? (
                    <p>Loading bookings...</p>
                  ) : (
                    <div className="bookings-sections">
                      {/* Artist Bookings Section */}
                      <div className="booking-section">
                        <h4 className="section-title">
                          🎤 Artist Bookings ({artistBookings.length})
                        </h4>
                        {artistBookings.length > 0 ? (
                          <div className="bookings-list">
                            {artistBookings.map((booking, index) => (
                              <div key={`artist-${index}`} className="booking-item">
                                <div className="booking-info">
                                  <h5>{booking.artist?.stageName || booking.artist?.artistName || (booking.artist?.firstName && booking.artist?.lastName ? `${booking.artist.firstName} ${booking.artist.lastName}` : booking.artist?.firstName || booking.artist?.lastName || 'Artist Booking')}</h5>
                                  <p><strong>Event Type:</strong> {booking.eventType}</p>
                                  <p><strong>Date:</strong> {formatDate(booking.eventDate)} at {booking.eventTime}</p>
                                  <p><strong>Venue:</strong> {booking.eventVenue}</p>
                                  <p><strong>Status:</strong> 
                                    <span className={`status-badge status-${booking.status}`}>
                                      {booking.status}
                                    </span>
                                  </p>
                                  <p><strong>Payment:</strong> 
                                    <span className={`payment-badge payment-${booking.paymentStatus}`}>
                                      {booking.paymentStatus}
                                    </span>
                                  </p>
                                </div>
                                
                                {/* Map Section */}
                                <div className="map-section">
                                  <button 
                                    className="toggle-map-btn"
                                    onClick={() => toggleMap(`artist-${booking._id}`)}
                                  >
                                    {expandedMaps[`artist-${booking._id}`] ? '🗺️ Hide Map' : '🗺️ Show Map & Track Artist'}
                                  </button>
                                  
                                  {expandedMaps[`artist-${booking._id}`] && (
                                    <div className="map-container">
                                      <ArtistBookingMap booking={booking} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-bookings">No artist bookings found.</p>
                        )}
                      </div>

                      {/* Event Bookings Section */}
                      <div className="booking-section">
                        <h4 className="section-title">
                          🎫 Event Bookings ({eventBookings.length})
                        </h4>
                        {eventBookings.length > 0 ? (
                          <div className="bookings-list">
                            {eventBookings.map((booking, index) => (
                              <div key={`event-${index}`} className="booking-item">
                                <div className="booking-info">
                                  <h5>{booking.event?.eventTitle || booking.event?.name || 'Event Booking'}</h5>
                                  <p><strong>Date:</strong> {formatDate(booking.bookingDate)}</p>
                                  <p><strong>Venue:</strong> {booking.event?.eventVenue || booking.event?.venue?.name || 'Venue TBD'}</p>
                                  <p><strong>Tickets:</strong> {booking.ticketsBooked} ticket(s)</p>
                                  <p><strong>Status:</strong> 
                                    <span className={`status-badge status-${booking.status}`}>
                                      {booking.status}
                                    </span>
                                  </p>
                                  {booking.paymentIntentId && (
                                    <p><strong>Payment ID:</strong> {booking.paymentIntentId.slice(-8)}</p>
                                  )}
                                </div>
                                
                                {/* Map Section */}
                                <div className="map-section">
                                  <button 
                                    className="toggle-map-btn"
                                    onClick={() => toggleMap(`event-${booking._id}`)}
                                  >
                                    {expandedMaps[`event-${booking._id}`] ? '🗺️ Hide Map' : '🗺️ Show Map & Directions'}
                                  </button>
                                  
                                  {expandedMaps[`event-${booking._id}`] && (
                                    <div className="map-container">
                                      <EventBookingMap booking={booking} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-bookings">No event bookings found.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="orders-history">
                  <h3>Order History</h3>
                  {loading ? (
                    <p>Loading orders...</p>
                  ) : orders.length > 0 ? (
                    <div className="orders-list">
                      {orders.map((order, index) => (
                        <div key={index} className="order-item">
                          <div className="order-info">
                            <h4>Order #{order._id?.slice(-8) || index + 1}</h4>
                            <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                            <p><strong>Status:</strong> {order.status || 'Processing'}</p>
                            <p><strong>Total:</strong> LKR {order.totalAmount || '0.00'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No orders found.</p>
                  )}
                </div>
              )}

              {activeTab === 'donations' && (
                <div className="donations-history">
                  <h3>Donation History</h3>
                  {loading ? (
                    <p>Loading donations...</p>
                  ) : donations.length > 0 ? (
                    <div className="donations-list">
                      {donations.map((donation, index) => (
                        <div key={index} className="donation-item">
                          <div className="donation-info">
                            <h4>{donation.packageName || 'Donation'}</h4>
                            <p><strong>Date:</strong> {formatDate(donation.createdAt || donation.Date)}</p>
                            <p><strong>Amount:</strong> LKR {donation.Amount || donation.amount || '0.00'}</p>
                            <p><strong>Status:</strong> 
                              <span className={`status-badge status-${donation.paymentStatus || donation.status || 'completed'}`}>
                                {donation.paymentStatus || donation.status || 'Completed'}
                              </span>
                            </p>
                            {donation.DonorNote && (
                              <p><strong>Note:</strong> {donation.DonorNote}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No donations found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ show: false, message: '', type: '' })}>×</button>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal">
            <div className="modal-header">
              <h3>✏️ Edit Profile</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="modal-body">
                {/* Profile Picture Upload */}
                <div className="form-group">
                  <label className="form-label">Profile Picture</label>
                  <div className="image-upload-section">
                    <div className="current-image">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="preview-image" />
                      ) : user.profilePicture ? (
                        <img src={getProfilePictureUrl(user.profilePicture)} alt="Current" className="preview-image" />
                      ) : (
                        <div className="default-avatar-preview">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                    />
                    <label htmlFor="profilePicture" className="file-input-label">
                      📷 Choose New Picture
                    </label>
                    {editErrors.profilePicture && (
                      <p className="error-message">{editErrors.profilePicture}</p>
                    )}
                  </div>
                </div>

                {/* First Name */}
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditInputChange}
                    className={`form-input ${editErrors.firstName ? 'error' : ''}`}
                    required
                    disabled={editing}
                  />
                  {editErrors.firstName && (
                    <p className="error-message">{editErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditInputChange}
                    className={`form-input ${editErrors.lastName ? 'error' : ''}`}
                    required
                    disabled={editing}
                  />
                  {editErrors.lastName && (
                    <p className="error-message">{editErrors.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className={`form-input ${editErrors.email ? 'error' : ''}`}
                    required
                    disabled={editing}
                  />
                  {editErrors.email && (
                    <p className="error-message">{editErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">New Password (optional)</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={editFormData.password}
                    onChange={handleEditInputChange}
                    className={`form-input ${editErrors.password ? 'error' : ''}`}
                    placeholder="Leave blank to keep current password"
                    disabled={editing}
                  />
                  {editErrors.password && (
                    <p className="error-message">{editErrors.password}</p>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={closeEditModal}
                  disabled={editing}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="save-btn"
                  disabled={editing}
                >
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>⚠️ Delete Profile</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete your profile?</p>
              <p><strong>This action cannot be undone.</strong></p>
              <p>All your data including bookings, orders, and donations will be permanently removed.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={handleDeleteProfile}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete My Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
