import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import MainNav from "../MainNav/MainNav";
import "./BookingSuccessPage.css";

const BACKEND_URL = "http://localhost:5000";

function BookingSuccessPage() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyPaymentAndGetBooking = async () => {
      try {
        setLoading(true);
        
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
          setBooking(bookingResponse.data);
          setPaymentVerified(true);
        } else {
          setError('No payment information found. Please contact support.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment. Please contact support.');
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="success-page">
        <MainNav />
        <div className="success-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h2>Verifying your payment...</h2>
            <p>Please wait while we confirm your booking.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="success-page">
        <MainNav />
        <div className="success-container">
          <div className="error-container">
            <div className="error-icon">❌</div>
            <h2>Payment Verification Failed</h2>
            <p>{error}</p>
            <div className="action-buttons">
              <button className="btn-primary" onClick={handleGoHome}>
                Go Home
              </button>
              <button className="btn-secondary" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <MainNav />
      
      <div className="success-container">
        <div className="success-content">
          {/* Success Header */}
          <div className="success-header">
            <div className="success-icon">✅</div>
            <h1 className="success-title">Booking Confirmed!</h1>
            <p className="success-subtitle">
              Your payment has been processed successfully and your booking is confirmed.
            </p>
          </div>

          {/* Booking Details */}
          {booking && (
            <div className="booking-details">
              <h3>Booking Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Customer Name:</span>
                  <span className="detail-value">{booking.customerName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Event Type:</span>
                  <span className="detail-value">{booking.eventType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Event Date:</span>
                  <span className="detail-value">
                    {new Date(booking.eventDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Booking ID:</span>
                  <span className="detail-value">{booking.bookingId || booking.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value status-paid">
                    {paymentVerified ? 'Paid & Confirmed' : 'Confirmed'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Status */}
          <div className="payment-status">
            <div className="status-badge success">
              <span className="status-icon">💳</span>
              <span className="status-text">Payment Successful</span>
            </div>
            <p className="status-description">
              Your payment has been processed and your booking is now confirmed. 
              You will receive a confirmation email shortly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn-download-invoice"
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
            >
              <span className="btn-icon">
                {downloadingInvoice ? '⏳' : '📄'}
              </span>
              {downloadingInvoice ? 'Generating...' : 'Download Invoice'}
            </button>
            
            <button className="btn-primary" onClick={handleGoToDashboard}>
              <span className="btn-icon">📊</span>
              View Dashboard
            </button>
            
            <button className="btn-secondary" onClick={handleGoHome}>
              <span className="btn-icon">🏠</span>
              Go Home
            </button>
          </div>

          {/* Additional Info */}
          <div className="additional-info">
            <h4>What's Next?</h4>
            <ul>
              <li>Your booking is confirmed and the artist has been notified</li>
              <li>You can view your booking details in the Artist Dashboard</li>
              <li>Download your invoice for your records</li>
              <li>Contact support if you have any questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccessPage;
