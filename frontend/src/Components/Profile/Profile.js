import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '../MainNav/MainNav';
import AuthFooter from '../Common/AuthFooter';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const [reviews, setReviews] = useState([]);
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
  const [showArtistMap, setShowArtistMap] = useState(false);
  const [showEventMap, setShowEventMap] = useState(false);
  const [mapInstances, setMapInstances] = useState(new Set());

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

  // Watch position for live location updates (same as contact us page)
  useEffect(() => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude
        });
      },
      (err) => {
        console.error('Geolocation error:', err);
        // Keep existing location if watch fails
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );

    // Cleanup function
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []); // Empty dependency array to run only once

  // Cleanup maps when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any existing map instances
      const mapContainers = document.querySelectorAll('.leaflet-container');
      mapContainers.forEach(container => {
        if (container._leaflet_id) {
          container._leaflet_id = null;
        }
      });
    };
  }, []);

  // Cleanup function for map containers
  const cleanupMapContainer = (containerId) => {
    const container = document.getElementById(containerId);
    if (container && container._leaflet_id) {
      container._leaflet_id = null;
    }
  };

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

  // Listen for payment success events and update booking status
  useEffect(() => {
    const handlePaymentSuccess = (event) => {
      console.log('Payment success event received:', event.detail);
      // Refresh booking data when payment is successful
      fetchUserData();
    };

    // Listen for URL changes that might indicate payment completion
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('session_id') || urlParams.get('payment_success')) {
        console.log('Payment completion detected from URL');
        fetchUserData();
      }
    };

    // Listen for storage changes (if payment status is stored in localStorage)
    const handleStorageChange = (e) => {
      if (e.key === 'paymentSuccess' || e.key === 'bookingUpdated') {
        console.log('Payment status change detected in storage');
        fetchUserData();
      }
    };

    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Check URL on component mount
    handleUrlChange();
    
    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Get user's current location with live updates (same as contact us page)
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
          // Set default location if geolocation fails
          setUserLocation({
            lat: 7.2906, // Default to Kandy, Sri Lanka
            lng: 80.6337
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      // Set default location if geolocation is not supported
      setUserLocation({
        lat: 7.2906, // Default to Kandy, Sri Lanka
        lng: 80.6337
      });
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
      // Fetch artist bookings, event bookings, orders, donations, and reviews in parallel
      const [artistBookingsRes, eventBookingsRes, ordersRes, donationsRes, artistReviewsRes, eventTestimonialsRes] = await Promise.allSettled([
        axios.get('http://localhost:5000/bookings'),
        axios.get('http://localhost:5000/eventBookings'),
        axios.get('http://localhost:5000/api/orders'),
        axios.get('http://localhost:5000/donor'),
        axios.get('http://localhost:5000/api/artist-reviews'),
        axios.get('http://localhost:5000/api/event-testimonials/testimonials')
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

      // Process artist reviews
      let artistReviews = [];
      if (artistReviewsRes.status === 'fulfilled') {
        const reviewsData = artistReviewsRes.value.data;
        const reviewsArray = reviewsData.reviews || reviewsData || [];
        artistReviews = Array.isArray(reviewsArray) ? reviewsArray.filter(
          review => review.customerName === user?.firstName + ' ' + user?.lastName || 
                   review.customerName === user?.firstName ||
                   review.customerName === user?.lastName ||
                   review.customerEmail === user?.email
        ) : [];
        console.log(`Found ${artistReviews.length} artist reviews for user ${user?.email}`);
      } else {
        console.error('Artist reviews request failed:', artistReviewsRes.reason);
      }

      // Process event testimonials
      let eventTestimonials = [];
      if (eventTestimonialsRes.status === 'fulfilled') {
        const testimonialsData = eventTestimonialsRes.value.data;
        const testimonialsArray = testimonialsData.testimonials || testimonialsData || [];
        eventTestimonials = Array.isArray(testimonialsArray) ? testimonialsArray.filter(
          testimonial => testimonial.customerName === user?.firstName + ' ' + user?.lastName || 
                       testimonial.customerName === user?.firstName ||
                       testimonial.customerName === user?.lastName ||
                       testimonial.customerEmail === user?.email
        ) : [];
        console.log(`Found ${eventTestimonials.length} event testimonials for user ${user?.email}`);
      } else {
        console.error('Event testimonials request failed:', eventTestimonialsRes.reason);
      }

      // Combine and format all reviews
      const allReviews = [
        ...artistReviews.map(review => ({
          ...review,
          type: 'artist',
          title: `Review for ${review.artist?.artistName || review.artist?.stageName || 'Artist'}`,
          rating: review.rating,
          comment: review.review,
          date: review.createdAt
        })),
        ...eventTestimonials.map(testimonial => ({
          ...testimonial,
          type: 'event',
          title: `Testimonial for ${testimonial.event?.eventTitle || testimonial.event?.name || 'Event'}`,
          rating: testimonial.rating || 5, // Default to 5 if no rating
          comment: testimonial.testimonial || testimonial.comment,
          date: testimonial.createdAt
        }))
      ];

      setReviews(allReviews);
      console.log(`Found ${allReviews.length} total reviews/testimonials for user ${user?.email}`);
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
    const primaryColor = [0, 0, 0]; // Black
    const secondaryColor = [0, 0, 0]; // Black
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
        
        autoTable(doc, {
          startY: yPosition,
          head: [['#', 'Artist', 'Event Type', 'Date', 'Status', 'Payment']],
          body: artistBookingData,
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
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
        
        autoTable(doc, {
          startY: yPosition,
          head: [['#', 'Event', 'Date', 'Tickets', 'Status', 'Payment ID']],
          body: eventBookingData,
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
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
      
      autoTable(doc, {
        startY: yPosition,
        head: [['#', 'Order ID', 'Date', 'Status', 'Total']],
        body: orderData,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
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
      
      autoTable(doc, {
        startY: yPosition,
        head: [['#', 'Package', 'Date', 'Status', 'Amount']],
        body: donationData,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
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
    // Clean up the map container before toggling
    cleanupMapContainer(bookingId);
    
    setExpandedMaps(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  // Clear individual booking functions with API calls
  const clearArtistBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to remove this artist booking? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await axios.delete(`http://localhost:5000/bookings/${bookingId}`);
        
        if (response.status === 200) {
          // Only remove from frontend after successful backend deletion
          setArtistBookings(prev => prev.filter(booking => booking._id !== bookingId));
          setExpandedMaps(prev => {
            const newExpandedMaps = { ...prev };
            delete newExpandedMaps[`artist-${bookingId}`];
            return newExpandedMaps;
          });
          showNotification('Artist booking deleted successfully', 'success');
        }
      } catch (error) {
        console.error('Error deleting artist booking:', error);
        showNotification('Failed to delete artist booking. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const clearEventBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to remove this event booking? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await axios.delete(`http://localhost:5000/eventBookings/${bookingId}`);
        
        if (response.status === 200) {
          // Only remove from frontend after successful backend deletion
          setEventBookings(prev => prev.filter(booking => booking._id !== bookingId));
          setExpandedMaps(prev => {
            const newExpandedMaps = { ...prev };
            delete newExpandedMaps[`event-${bookingId}`];
            return newExpandedMaps;
          });
          showNotification('Event booking deleted successfully', 'success');
        }
      } catch (error) {
        console.error('Error deleting event booking:', error);
        showNotification('Failed to delete event booking. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const clearOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to remove this order? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
        
        if (response.status === 200) {
          // Only remove from frontend after successful backend deletion
          setOrders(prev => prev.filter(order => order._id !== orderId));
          showNotification('Order deleted successfully', 'success');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        showNotification('Failed to delete order. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const clearDonation = async (donationId) => {
    if (window.confirm('Are you sure you want to remove this donation? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await axios.delete(`http://localhost:5000/donor/${donationId}`);
        
        if (response.status === 200) {
          // Only remove from frontend after successful backend deletion
          setDonations(prev => prev.filter(donation => donation._id !== donationId));
          showNotification('Donation deleted successfully', 'success');
        }
      } catch (error) {
        console.error('Error deleting donation:', error);
        showNotification('Failed to delete donation. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const getDirectionsUrl = (destination) => {
    if (!userLocation) {
      // If no user location available, prompt user to enable location
      return `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destination.lat},${destination.lng}`;
  };

  // Helper function to get venue location for event bookings (same logic as EventBookingMap)
  const getEventVenueLocation = (booking) => {
    if (!booking.event) {
      console.log('No event data for booking:', booking._id);
      return { lat: 6.9271, lng: 79.8612 };
    }

    // First try: venueCoordinates from event
    if (booking.event.venueCoordinates?.latitude && booking.event.venueCoordinates?.longitude) {
      console.log('Using venueCoordinates:', booking.event.venueCoordinates);
      return { 
        lat: booking.event.venueCoordinates.latitude, 
        lng: booking.event.venueCoordinates.longitude 
      };
    }
    // Second try: venue.location
    else if (booking.event.venue?.location?.lat && booking.event.venue?.location?.lng) {
      console.log('Using venue.location:', booking.event.venue.location);
      return booking.event.venue.location;
    }
    // Third try: eventLocation from booking
    else if (booking.eventLocation?.lat && booking.eventLocation?.lng) {
      console.log('Using eventLocation:', booking.eventLocation);
      return booking.eventLocation;
    }
    // Fallback: Default to Colombo, Sri Lanka
    else {
      console.log('Using fallback location for booking:', booking._id);
      return { lat: 6.9271, lng: 79.8612 };
    }
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

    // Check if event location is valid
    if (typeof eventLocation.lat !== 'number' || typeof eventLocation.lng !== 'number') {
      return <p>Event location coordinates not available</p>;
    }

    // Ensure coordinates are valid numbers
    const center = [Number(eventLocation.lat), Number(eventLocation.lng)];
    if (isNaN(center[0]) || isNaN(center[1])) {
      return <p>Invalid location coordinates</p>;
    }

    return (
      <div className="booking-map">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '250px', width: '100%', maxHeight: '250px', minHeight: '250px' }}
          key={`artist-map-${booking._id}`}
          id={`artist-map-${booking._id}`}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Event location marker */}
          <Marker position={center}>
            <Popup>
              <div>
                <strong>Event Location</strong><br />
                {booking.eventVenue}<br />
                <small>Event Date: {formatDate(booking.eventDate)}</small>
              </div>
            </Popup>
          </Marker>

          {/* Artist location marker (if available) */}
          {artistLocation && typeof artistLocation.lat === 'number' && typeof artistLocation.lng === 'number' && (
            <Marker position={[Number(artistLocation.lat), Number(artistLocation.lng)]}>
              <Popup>
                <div>
                  <strong>Artist Location</strong><br />
                  <small>Last updated: {artistLocation.lastUpdated ? new Date(artistLocation.lastUpdated).toLocaleTimeString() : 'Unknown'}</small>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    );
  };

  // Map component for event bookings
  const EventBookingMap = ({ booking }) => {
    if (!booking.event) return <p>Event information not available</p>;

    // Try to get venue coordinates from multiple sources
    let venueLocation = null;
    
    // First try: venueCoordinates from event
    if (booking.event.venueCoordinates?.latitude && booking.event.venueCoordinates?.longitude) {
      venueLocation = { 
        lat: booking.event.venueCoordinates.latitude, 
        lng: booking.event.venueCoordinates.longitude 
      };
    }
    // Second try: venue.location
    else if (booking.event.venue?.location?.lat && booking.event.venue?.location?.lng) {
      venueLocation = booking.event.venue.location;
    }
    // Third try: eventLocation from booking
    else if (booking.eventLocation?.lat && booking.eventLocation?.lng) {
      venueLocation = booking.eventLocation;
    }
    // Fallback: Default to Colombo, Sri Lanka
    else {
      venueLocation = { lat: 6.9271, lng: 79.8612 };
    }

    // Check if venue location is valid
    if (!venueLocation || typeof venueLocation.lat !== 'number' || typeof venueLocation.lng !== 'number') {
      return (
        <div className="venue-location-fallback">
          <p>📍 <strong>Venue:</strong> {booking.event.eventVenue || booking.event.venue?.name || 'Venue not specified'}</p>
          <p>🗺️ <strong>Note:</strong> Map coordinates not available for this venue</p>
          <p>📍 <strong>Address:</strong> Please check the event details for the exact location</p>
        </div>
      );
    }

    // Ensure coordinates are valid numbers
    const center = [Number(venueLocation.lat), Number(venueLocation.lng)];
    if (isNaN(center[0]) || isNaN(center[1])) {
      return (
        <div className="venue-location-fallback">
          <p>📍 <strong>Venue:</strong> {booking.event.eventVenue || booking.event.venue?.name || 'Venue not specified'}</p>
          <p>🗺️ <strong>Note:</strong> Map coordinates not available for this venue</p>
          <p>📍 <strong>Address:</strong> Please check the event details for the exact location</p>
        </div>
      );
    }

    return (
      <div className="booking-map">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '250px', width: '100%', maxHeight: '250px', minHeight: '250px' }}
          key={`event-map-${booking._id}`}
          id={`event-map-${booking._id}`}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <Marker position={center}>
            <Popup>
              <div className="venue-popup">
                <h4>🎯 {booking.event.eventTitle || booking.event.name}</h4>
                <p><strong>📍 Venue:</strong> {booking.event.eventVenue || booking.event.venue?.name}</p>
                <p><strong>📅 Date:</strong> {formatDate(booking.event.eventDate || booking.event.date)}</p>
                {booking.event.eventTime && (
                  <p><strong>🕐 Time:</strong> {booking.event.eventTime}</p>
                )}
                <p><strong>🎫 Tickets:</strong> {booking.ticketsBooked} ticket(s)</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    );
  };

  // Map component for orders
  const OrderMap = ({ order }) => {
    // Use delivery address coordinates if available, otherwise default to Colombo
    const deliveryLocation = order.deliveryAddress?.coordinates || {
      lat: 6.9271,
      lng: 79.8612
    };

    // Ensure coordinates are valid numbers
    const center = [Number(deliveryLocation.lat), Number(deliveryLocation.lng)];
    if (isNaN(center[0]) || isNaN(center[1])) {
      return <p>Invalid delivery coordinates</p>;
    }

    return (
      <div className="booking-map">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '250px', width: '100%', maxHeight: '250px', minHeight: '250px' }}
          key={`order-map-${order._id}`}
          id={`order-map-${order._id}`}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={center}>
            <Popup>
              <div>
                <h4>Order #{order._id?.slice(-8)}</h4>
                <p>Delivery Address</p>
                {order.deliveryAddress && (
                  <div>
                    <p>{order.deliveryAddress.address}</p>
                    <p>{order.deliveryAddress.city}, {order.deliveryAddress.district}</p>
                    <p>{order.deliveryAddress.postalCode}</p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
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
          <p className="profile-subtext">
            Manage your account settings, view booking history, and track your orders and donations
          </p>
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
                  Edit Profile
                </button>
                
                <button 
                  className="download-pdf-btn"
                  onClick={generateActivityPDF}
                  title="Download your activity report as PDF"
                >
                  Download My Activity PDF
                </button>
                
                <button 
                  className="delete-profile-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete your profile permanently"
                >
                  Delete Profile
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
              <button
                className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                My Reviews ({reviews.length})
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
                          Artist Bookings ({artistBookings.length})
                        </h4>
                        
                        {artistBookings.map((booking, index) => (
                          <div key={`artist-${index}`} className="booking-widget">
                            <div className="widget-header">
                              <h5 className="widget-title">
                                {booking.artist?.stageName || booking.artist?.artistName || (booking.artist?.firstName && booking.artist?.lastName ? `${booking.artist.firstName} ${booking.artist.lastName}` : booking.artist?.firstName || booking.artist?.lastName || 'Artist Booking')}
                              </h5>
                              <div className="widget-actions">
                                <button 
                                  className="widget-btn map-btn"
                                  onClick={() => toggleMap(`artist-${booking._id}`)}
                                >
                                  {expandedMaps[`artist-${booking._id}`] ? 'Hide Map' : 'Show Map & Directions'}
                                </button>
                                <button 
                                  className="widget-btn clear-btn"
                                  onClick={() => clearArtistBooking(booking._id)}
                                >
                                  Clear Booking
                                </button>
                              </div>
                            </div>
                            
                            <div className="widget-content">
                              <div className="info-stack">
                                <div className="info-line">
                                  <span className="info-label">Event Name:</span>
                                  <span className="info-value">{booking.eventType}</span>
                                </div>
                                <div className="info-line">
                                  <span className="info-label">Artist Name:</span>
                                  <span className="info-value">{booking.artist?.stageName || booking.artist?.artistName || (booking.artist?.firstName && booking.artist?.lastName ? `${booking.artist.firstName} ${booking.artist.lastName}` : booking.artist?.firstName || booking.artist?.lastName || 'Artist Booking')}</span>
                                </div>
                                <div className="info-line">
                                  <span className="info-label">Date:</span>
                                  <span className="info-value">{formatDate(booking.eventDate)} at {booking.eventTime}</span>
                                </div>
                                <div className="info-line">
                                  <span className="info-label">Venue:</span>
                                  <span className="info-value">{booking.eventVenue}</span>
                                </div>
                                <div className="info-line">
                                  <span className="info-label">Payment:</span>
                                  <span className={`payment-badge payment-${(booking.paymentStatus === 'paid' || booking.status === 'paid') ? 'paid' : 'not-paid'}`}>
                                    {(booking.paymentStatus === 'paid' || booking.status === 'paid') ? 'Paid' : 'Not Paid'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {expandedMaps[`artist-${booking._id}`] && (
                              <>
                                <div className="map-container">
                                  <ArtistBookingMap booking={booking} />
                                </div>
                                <div className="map-actions">
                                  <a
                                    href={getDirectionsUrl(booking.eventLocation)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="directions-btn"
                                  >
                                    Get Directions
                                  </a>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Event Bookings Section */}
                      <div className="booking-section">
                        <h4 className="section-title">
                          Event Bookings ({eventBookings.length})
                        </h4>
                        
                        {eventBookings.map((booking, index) => (
                          <div key={`event-${index}`} className="booking-widget">
                            <div className="widget-header">
                              <h5 className="widget-title">
                                {booking.event?.eventTitle || booking.event?.name || 'Event Booking'}
                              </h5>
                              <div className="widget-actions">
                                <button 
                                  className="widget-btn map-btn"
                                  onClick={() => toggleMap(`event-${booking._id}`)}
                                >
                                  {expandedMaps[`event-${booking._id}`] ? 'Hide Map' : 'Show Map & Directions'}
                                </button>
                                <button 
                                  className="widget-btn clear-btn"
                                  onClick={() => clearEventBooking(booking._id)}
                                >
                                  Clear Booking
                                </button>
                              </div>
                            </div>
                            
                            <div className="widget-content">
                              <div className="info-stack">
                                <div className="info-line">
                                  <span className="info-label">Event Name:</span>
                                  <span className="info-value">{booking.event?.eventTitle || booking.event?.name || 'Event Booking'}</span>
                                </div>
                                <div className="info-line">
                                  <span className="info-label">Date:</span>
                                  <span className="info-value">{formatDate(booking.bookingDate)}</span>
                                </div>
                                <div className="info-line">
                                  <span className="info-label">Venue:</span>
                                  <span className="info-value">{booking.event?.eventVenue || booking.event?.venue?.name || 'Venue TBD'}</span>
                                </div>
                                <div className="info-line">
                                  <span className="info-label">Tickets:</span>
                                  <span className="info-value">{booking.ticketsBooked} ticket(s)</span>
                                </div>
                                <div className="info-line">
                                  <span className="info-label">Payment:</span>
                                  <span className={`payment-badge payment-${(booking.paymentStatus === 'paid' || booking.status === 'paid') ? 'paid' : 'not-paid'}`}>
                                    {(booking.paymentStatus === 'paid' || booking.status === 'paid') ? 'Paid' : 'Not Paid'}
                                  </span>
                                </div>
                                {booking.paymentIntentId && (
                                  <div className="info-line">
                                    <span className="info-label">Payment ID:</span>
                                    <span className="info-value">{booking.paymentIntentId.slice(-8)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {expandedMaps[`event-${booking._id}`] && (
                              <>
                                <div className="map-container">
                                  <EventBookingMap booking={booking} />
                                </div>
                                <div className="map-actions">
                                  <a
                                    href={getDirectionsUrl(getEventVenueLocation(booking))}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="directions-btn"
                                  >
                                    Get Directions
                                  </a>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="orders-history">
                  <h3>Marketplace Purchases ({orders.length})</h3>
                  {loading ? (
                    <p>Loading orders...</p>
                  ) : orders.length > 0 ? (
                    <div className="booking-section">
                      {orders.map((order, index) => (
                        <div key={`order-${index}`} className="booking-widget order-widget">
                          <div className="widget-header">
                            <h5 className="widget-title">
                              Order #{order._id?.slice(-8) || index + 1}
                            </h5>
                            <div className="widget-actions">
                              <button 
                                className="widget-btn map-btn"
                                onClick={() => toggleMap(`order-${order._id}`)}
                              >
                                {expandedMaps[`order-${order._id}`] ? 'Hide Map' : 'Show Map & Directions'}
                              </button>
                              <button 
                                className="widget-btn clear-btn"
                                onClick={() => clearOrder(order._id)}
                              >
                                Clear Order
                              </button>
                            </div>
                          </div>
                          
                          <div className="widget-content">
                            <div className="info-stack">
                              <div className="info-line">
                                <span className="info-label">Order ID:</span>
                                <span className="info-value">#{order._id?.slice(-8) || index + 1}</span>
                              </div>
                              <div className="info-line">
                                <span className="info-label">Date:</span>
                                <span className="info-value">{formatDate(order.createdAt)}</span>
                              </div>
                              <div className="info-line">
                                <span className="info-label">Total:</span>
                                <span className="info-value">LKR {order.totalAmount || '0.00'}</span>
                              </div>
                              <div className="info-line">
                                <span className="info-label">Items:</span>
                                <span className="info-value">{order.items?.length || 0} item(s)</span>
                              </div>
                              <div className="info-line">
                                <span className="info-label">Payment:</span>
                                <span className={`payment-badge payment-${(order.paymentStatus === 'paid' || order.status === 'paid' || order.status === 'completed') ? 'paid' : 'not-paid'}`}>
                                  {(order.paymentStatus === 'paid' || order.status === 'paid' || order.status === 'completed') ? 'Paid' : 'Not Paid'}
                                </span>
                              </div>
                              {order.paymentIntentId && (
                                <div className="info-line">
                                  <span className="info-label">Payment ID:</span>
                                  <span className="info-value">{order.paymentIntentId.slice(-8)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {expandedMaps[`order-${order._id}`] && (
                            <>
                              <div className="map-container">
                                <OrderMap order={order} />
                              </div>
                              <div className="map-actions">
                                <a
                                  href={getDirectionsUrl(order.deliveryAddress?.coordinates || {lat: 6.9271, lng: 79.8612})}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="directions-btn"
                                >
                                  Get Directions
                                </a>
                              </div>
                            </>
                          )}
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
                  <h3>Donation History ({donations.length})</h3>
                  {loading ? (
                    <p>Loading donations...</p>
                  ) : donations.length > 0 ? (
                    <div className="booking-section">
                      {donations.map((donation, index) => (
                        <div key={index} className="booking-widget donation-widget">
                          <div className="widget-header">
                            <h5 className="widget-title">
                              {donation.packageName || 'Donation'}
                            </h5>
                            <div className="widget-actions">
                              <button 
                                className="widget-btn clear-btn"
                                onClick={() => clearDonation(donation._id)}
                              >
                                Clear Donation
                              </button>
                            </div>
                          </div>
                          
                          <div className="widget-content">
                            <div className="info-stack">
                              <div className="info-line">
                                <span className="info-label">Date:</span>
                                <span className="info-value">{formatDate(donation.createdAt || donation.Date)}</span>
                              </div>
                              <div className="info-line">
                                <span className="info-label">Amount:</span>
                                <span className="info-value">LKR {donation.Amount || donation.amount || '0.00'}</span>
                              </div>
                              <div className="info-line">
                                <span className="info-label">Payment:</span>
                                <span className={`payment-badge payment-${(donation.paymentStatus === 'paid' || donation.status === 'paid' || donation.status === 'completed') ? 'paid' : 'not-paid'}`}>
                                  {(donation.paymentStatus === 'paid' || donation.status === 'paid' || donation.status === 'completed') ? 'Paid' : 'Not Paid'}
                                </span>
                              </div>
                              {donation.DonorNote && (
                                <div className="info-line">
                                  <span className="info-label">Note:</span>
                                  <span className="info-value">{donation.DonorNote}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No donations found.</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="reviews-history">
                  <h3>My Reviews ({reviews.length})</h3>
                  {loading ? (
                    <p>Loading reviews...</p>
                  ) : reviews.length > 0 ? (
                    <div className="booking-section">
                      {reviews.map((review, index) => (
                        <div key={index} className="booking-widget review-widget">
                          <div className="widget-header">
                            <h5 className="widget-title">
                              {review.title}
                            </h5>
                            <div className="widget-actions">
                              <span className="review-type-badge">
                                {review.type === 'artist' ? 'Artist Review' : 'Event Testimonial'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="widget-content">
                            <div className="info-stack">
                              <div className="info-line">
                                <span className="info-label">Rating:</span>
                                <div className="review-rating">
                                  <span className="stars">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                  </span>
                                  <span className="rating-text">{review.rating} out of 5 stars</span>
                                </div>
                              </div>
                              <div className="info-line">
                                <span className="info-label">Comment:</span>
                                <span className="info-value review-comment">"{review.comment}"</span>
                              </div>
                              <div className="info-line">
                                <span className="info-label">Posted:</span>
                                <span className="info-value">{formatDate(review.date)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No reviews found. Start reviewing artists you've booked or events you've attended!</p>
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
        <div className="edit-modal-overlay">
          <div className="edit-modal-content">
            <div className="edit-modal-header">
              <h3>Edit Profile</h3>
              <button 
                className="edit-modal-close"
                onClick={closeEditModal}
                disabled={editing}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="edit-modal-body">
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
                      Choose New Picture
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

              <div className="edit-modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeEditModal}
                  disabled={editing}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
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
      <AuthFooter />
    </div>
  );
}

export default Profile;
