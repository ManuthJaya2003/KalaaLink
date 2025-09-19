import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import MainNav from "../MainNav/MainNav";
import AuthFooter from "../Common/AuthFooter";
import VenueMap from "../Lihini/Events/VenueMap";
import "../Lihini/Event/Event.css";

const BACKEND_URL = "http://localhost:5000";

function BookingSuccessPage() {
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyPaymentAndGetBooking = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(location.search);
        const sessionId = urlParams.get('session_id');
        const bookingId = urlParams.get('bookingId');
        const artistName = urlParams.get('artist');
        const eventType = urlParams.get('event');

        console.log('Success page parameters:', { sessionId, bookingId, artistName, eventType });

        if (sessionId) {
          // Verify payment with session ID
          console.log('Verifying payment with session ID:', sessionId);
          const verifyResponse = await axios.post(`${BACKEND_URL}/bookings/verify-payment`, {
            sessionId: sessionId
          });

          if (verifyResponse.data.success) {
            console.log('✅ Payment verified successfully');
            setPaymentVerified(true);
            
            // Get booking details
            const bookingData = verifyResponse.data.booking;
            // Add URL parameters to booking data if not present
            if (artistName && artistName !== 'undefined') {
              bookingData.artistName = artistName;
            }
            if (eventType && eventType !== 'undefined') {
              bookingData.eventType = eventType;
            }
            setBooking(bookingData);
            
            // Show success notification
            console.log('Booking confirmed:', bookingData);
          } else {
            setError('Payment verification failed. Please contact support.');
          }
        } else if (bookingId) {
          // Fallback: get booking by ID
          console.log('Getting booking by ID:', bookingId);
          const bookingResponse = await axios.get(`${BACKEND_URL}/bookings/test-payment/${bookingId}`);
          const bookingData = bookingResponse.data;
          // Add URL parameters to booking data if not present
          if (artistName && artistName !== 'undefined') {
            bookingData.artistName = artistName;
          }
          if (eventType && eventType !== 'undefined') {
            bookingData.eventType = eventType;
          }
          setBooking(bookingData);
          setPaymentVerified(true);
        } else {
          setError('No payment information found. Please contact support.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment. Please contact support.');
      }
    };

    verifyPaymentAndGetBooking();
  }, [location.search]);

  const handleDownloadInvoice = async () => {
    if (!booking) return;

    try {
      setDownloadingInvoice(true);
      
      // Generate and download invoice
      const response = await axios.post(`${BACKEND_URL}/bookings/generate-invoice`, {
        bookingId: booking.bookingId || booking.id
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${booking.bookingId || booking.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('✅ Invoice downloaded successfully');
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/artist-dashboard');
  };

  const handleGoHome = () => {
    navigate('/');
  };


  if (error) {
    return (
      <div>
        <MainNav />
        <div className="success-container">
          <div className="success-card">
            <div className="error-icon">❌</div>
            <h2>Payment Verification Failed</h2>
            <p>{error}</p>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={handleGoHome}>
                Go Home
              </button>
              <button className="btn btn-secondary" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          </div>
        </div>
        <AuthFooter />
      </div>
    );
  }

  return (
    <div>
      <MainNav />
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h1 className="success-title">Payment Successful!</h1>
          <p className="success-subtitle">
            Your artist booking has been confirmed and payment has been processed.
          </p>

          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 auto',
            background: '#f9fafb',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <img src="/logo.png" alt="KalaaLink Logo" style={{ height: '50px', width: 'auto', maxWidth: '150px' }} />
            </div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#2D3748' }}>Booking Details</h3>
            {booking && (
              <>
                {booking.artistName && booking.artistName !== 'undefined' && (
                  <div style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#C1A37F', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline' }}>Artist:</span>
                    <span style={{ color: '#2D3748', fontWeight: '500', fontSize: '16px', display: 'inline', marginLeft: '8px' }}>{booking.artistName}</span>
                  </div>
                )}
                {booking.eventType && booking.eventType !== 'undefined' && (
                  <div style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#C1A37F', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline' }}>Event:</span>
                    <span style={{ color: '#2D3748', fontWeight: '500', fontSize: '16px', display: 'inline', marginLeft: '8px' }}>{booking.eventType}</span>
                  </div>
                )}
                <div style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#C1A37F', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline' }}>Customer:</span>
                  <span style={{ color: '#2D3748', fontWeight: '500', fontSize: '16px', display: 'inline', marginLeft: '8px' }}>{booking.customerName || 'Customer'}</span>
                </div>
                <div style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#C1A37F', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline' }}>Date:</span>
                  <span style={{ color: '#2D3748', fontWeight: '500', fontSize: '16px', display: 'inline', marginLeft: '8px' }}>
                    {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
                <div style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#C1A37F', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline' }}>Booking ID:</span>
                  <span style={{ color: '#2D3748', fontWeight: '500', fontSize: '16px', display: 'inline', marginLeft: '8px' }}>{booking.bookingId || booking.id || 'N/A'}</span>
                </div>
                <div style={{ display: 'block', padding: '8px 0', textAlign: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#C1A37F', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline' }}>Status:</span>
                  <span style={{ color: '#2D3748', fontWeight: '500', fontSize: '16px', display: 'inline', marginLeft: '8px' }}>Confirmed</span>
                </div>
              </>
            )}
          </div>

          <div className="success-actions">
            <button onClick={handleDownloadInvoice} className="btn btn-success" disabled={downloadingInvoice}>
              {downloadingInvoice ? 'Generating...' : 'Download Invoice'}
            </button>
            <button onClick={handleGoToDashboard} className="btn btn-secondary">
              View Dashboard
            </button>
            <button onClick={handleGoHome} className="btn btn-secondary">
              Browse More Artists
            </button>
          </div>

          {/* Venue Map Section - Only show if we have venue info */}
          {booking && booking.eventVenue && (
            <div className="venue-section">
              <h3 className="venue-section-title">📍 Event Location</h3>
              <div style={{ textAlign: 'center', padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#2D3748' }}>{booking.eventVenue}</p>
                {booking.eventLocation && booking.eventLocation.lat && booking.eventLocation.lng && (
                  <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                    Coordinates: {booking.eventLocation.lat.toFixed(4)}, {booking.eventLocation.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="success-info">
            <p>
              <strong>Important:</strong> Please check your email for a confirmation 
              message with your booking details. The artist has been notified of your booking.
            </p>
          </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}

export default BookingSuccessPage;
