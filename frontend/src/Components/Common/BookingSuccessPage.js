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
      
      // Show invoice preview first
      generateInvoicePreview();
      
      // Then generate and download invoice
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

  const generateInvoicePreview = () => {
    // Create a new window with the invoice preview
    const invoiceWindow = window.open('', '_blank', 'width=800,height=600');
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Invoice - ${booking.bookingId || booking.id}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .invoice {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .invoice::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
          }
          .invoice-header {
            margin-bottom: 30px;
          }
          .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .invoice-subtitle {
            font-size: 16px;
            color: #7f8c8d;
            margin-bottom: 20px;
          }
          .invoice-logo {
            margin-bottom: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .invoice-logo img {
            height: 60px;
            width: auto;
            max-width: 200px;
            object-fit: contain;
          }
          .invoice-details {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            margin: 25px 0;
            text-align: left;
          }
          .invoice-detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .invoice-detail-row:last-child {
            border-bottom: none;
          }
          .invoice-detail-label {
            font-weight: 600;
            color: #495057;
            min-width: 120px;
          }
          .invoice-detail-value {
            color: #2c3e50;
            text-align: right;
            flex: 1;
          }
          .invoice-status {
            background: #28a745;
            color: white;
            padding: 8px 20px;
            border-radius: 25px;
            font-weight: 600;
            display: inline-block;
            margin: 20px 0;
          }
          .invoice-footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px dashed #e9ecef;
            color: #6c757d;
            font-size: 14px;
          }
          .booking-items {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
          }
          .booking-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .booking-item:last-child {
            border-bottom: none;
          }
          .item-image {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            overflow: hidden;
            margin-right: 15px;
            background: #e9ecef;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
            font-size: 24px;
          }
          .item-details {
            flex: 1;
          }
          .item-name {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          .item-price {
            color: #28a745;
            font-weight: 600;
          }
          @media print {
            body { background: white; }
            .invoice { box-shadow: none; border: 2px solid #333; }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="invoice-header">
            <div class="invoice-logo">
              <img src="/logo.png" alt="KalaaLink Logo" />
            </div>
            <div class="invoice-title">BOOKING INVOICE</div>
            <div class="invoice-subtitle">KalaaLink - Your Gateway to Art & Culture</div>
          </div>
          
          <div class="invoice-details">
            <div class="invoice-detail-row">
              <span class="invoice-detail-label">Booking ID:</span>
              <span class="invoice-detail-value">${booking.bookingId || booking.id}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-detail-label">Customer:</span>
              <span class="invoice-detail-value">${booking.customerName || 'Customer'}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-detail-label">Email:</span>
              <span class="invoice-detail-value">${booking.customerEmail || 'N/A'}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-detail-label">Booking Date:</span>
              <span class="invoice-detail-value">${new Date(booking.createdAt || new Date()).toLocaleDateString()}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-detail-label">Event Date:</span>
              <span class="invoice-detail-value">${booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'TBD'}</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-detail-label">Payment Status:</span>
              <span class="invoice-detail-value">Paid & Confirmed</span>
            </div>
            <div class="invoice-detail-row">
              <span class="invoice-detail-label">Total Amount:</span>
              <span class="invoice-detail-value">LKR ${booking.totalAmount || '0.00'}</span>
            </div>
          </div>

          <div class="booking-items">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">Booking Items</h3>
            <div class="booking-item">
              <div class="item-image">🎨</div>
              <div class="item-details">
                <div class="item-name">${booking.artistName || 'Artist'} - ${booking.eventType || 'Event'}</div>
                <div class="item-price">LKR ${booking.totalAmount || '0.00'}</div>
              </div>
            </div>
          </div>

          <div class="invoice-status">Booking Confirmed</div>
          
          <div class="invoice-footer">
            <p>Thank you for your booking!</p>
            <p>For support, contact us at support@kalaalink.com</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
  };

  const handleBrowseArtists = () => {
    navigate('/artists');
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
              <button className="btn btn-primary" onClick={handleBrowseArtists}>
                Browse Artists
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
            <button onClick={handleBrowseArtists} className="btn btn-secondary">
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
