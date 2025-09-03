import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainNav from "../../MainNav/MainNav";
import VenueMap from "./VenueMap";
import "../Event/Event.css";

function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bookingId = searchParams.get("bookingId");

  const verifyPayment = useCallback(async () => {
    try {
      console.log("Starting payment verification for booking:", bookingId);
      
      // Simple approach: just check the current booking status
      const response = await fetch(`http://localhost:5000/eventBookings/booking/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Booking data:", data);
        
        if (data.booking) {
          // If already paid, show success
          if (data.booking.status === "paid") {
            setBooking(data.booking);
            setLoading(false);
            return;
          }
          
          // If still pending, mark as paid (since user reached success page)
          if (data.booking.status === "pending") {
            console.log("Marking booking as paid...");
            await markBookingAsPaid();
            return;
          }
        }
      }
      
      setError("Unable to verify payment. Please contact support.");
      setLoading(false);
    } catch (err) {
      console.error("Payment verification error:", err);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }, [bookingId]);

  const markBookingAsPaid = async () => {
    try {
      const response = await fetch(`http://localhost:5000/eventBookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "paid" }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Booking marked as paid:", data);
        setBooking(data.booking);
        setLoading(false);
      } else {
        setError("Failed to update payment status. Please contact support.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error marking booking as paid:", err);
      setError("Failed to update payment status. Please contact support.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      verifyPayment();
    } else {
      setError("Invalid payment confirmation");
      setLoading(false);
    }
  }, [bookingId, verifyPayment]);

  const handleViewEvents = () => {
    navigate("/lihini/events");
  };

  const handleDownloadTicket = () => {
    if (!booking) return;
    
    // Generate a professional PDF ticket
    generateTicketPDF();
  };

  const generateTicketPDF = () => {
    // Create a new window with the ticket content
    const ticketWindow = window.open('', '_blank', 'width=800,height=600');
    
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Event Ticket - ${booking.event?.eventTitle || 'Event'}</title>
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
          .ticket {
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
          .ticket::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
          }
          .ticket-header {
            margin-bottom: 30px;
          }
          .ticket-title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .ticket-subtitle {
            font-size: 16px;
            color: #7f8c8d;
            margin-bottom: 20px;
          }
          .ticket-logo {
            font-size: 48px;
            margin-bottom: 20px;
          }
          .ticket-details {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            margin: 25px 0;
            text-align: left;
          }
          .ticket-detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .ticket-detail-row:last-child {
            border-bottom: none;
          }
          .ticket-detail-label {
            font-weight: 600;
            color: #495057;
            min-width: 120px;
          }
          .ticket-detail-value {
            color: #2c3e50;
            text-align: right;
            flex: 1;
          }
          .ticket-status {
            background: #28a745;
            color: white;
            padding: 8px 20px;
            border-radius: 25px;
            font-weight: 600;
            display: inline-block;
            margin: 20px 0;
          }
          .ticket-footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px dashed #e9ecef;
            color: #6c757d;
            font-size: 14px;
          }
          .ticket-qr-placeholder {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            color: #6c757d;
            font-size: 12px;
          }
          .ticket-validity {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
            font-size: 14px;
          }
          @media print {
            body { background: white; }
            .ticket { box-shadow: none; border: 2px solid #333; }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="ticket-header">
            <div class="ticket-logo">🎫</div>
            <div class="ticket-title">EVENT TICKET</div>
            <div class="ticket-subtitle">KalaaLink - Your Gateway to Art & Culture</div>
          </div>
          
          <div class="ticket-details">
            <div class="ticket-detail-row">
              <span class="ticket-detail-label">Event:</span>
              <span class="ticket-detail-value">${booking.event?.eventTitle || 'Event'}</span>
            </div>
            <div class="ticket-detail-row">
              <span class="ticket-detail-label">Customer:</span>
              <span class="ticket-detail-value">${booking.customerName}</span>
            </div>
            <div class="ticket-detail-row">
              <span class="ticket-detail-label">Email:</span>
              <span class="ticket-detail-value">${booking.customerEmail}</span>
            </div>
            <div class="ticket-detail-row">
              <span class="ticket-detail-label">Tickets:</span>
              <span class="ticket-detail-value">${booking.ticketsBooked}</span>
            </div>
            <div class="ticket-detail-row">
              <span class="ticket-detail-label">Booking Date:</span>
              <span class="ticket-detail-value">${new Date(booking.bookingDate).toLocaleDateString()}</span>
            </div>
            <div class="ticket-detail-row">
              <span class="ticket-detail-label">Booking ID:</span>
              <span class="ticket-detail-value">${booking._id}</span>
            </div>
            ${booking.event?.eventDate ? `
            <div class="ticket-detail-row">
              <span class="ticket-detail-label">Event Date:</span>
              <span class="ticket-detail-value">${new Date(booking.event.eventDate).toLocaleDateString()}</span>
            </div>
            ` : ''}
            ${booking.event?.eventTime ? `
            <div class="ticket-detail-row">
              <span class="ticket-detail-label">Event Time:</span>
              <span class="ticket-detail-value">${booking.event.eventTime}</span>
            </div>
            ` : ''}
            ${booking.event?.eventVenue ? `
            <div class="ticket-detail-row">
              <span class="ticket-detail-label">Venue:</span>
              <span class="ticket-detail-value">${booking.event.eventVenue}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="ticket-status">CONFIRMED & PAID</div>
          
          <div class="ticket-qr-placeholder">
            <div style="text-align: center; margin-bottom: 10px;">📱</div>
            <div style="text-align: center; font-weight: 600;">QR Code</div>
            <div style="text-align: center; font-size: 10px;">Scan at event entrance</div>
          </div>
          
          <div class="ticket-validity">
            <strong>Important:</strong> This ticket is valid for entry to the event. 
            Please present this ticket (digital or printed) at the entrance.
          </div>
          
          <div class="ticket-footer">
            <div style="margin-bottom: 10px;">
              <strong>KalaaLink</strong> - Connecting Artists & Audiences
            </div>
            <div style="font-size: 12px;">
              Generated on ${new Date().toLocaleString()}
            </div>
            <div style="font-size: 12px; margin-top: 5px;">
              For support: support@kalaalink.com
            </div>
          </div>
        </div>
        
        <script>
          // Auto-print when opened
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;
    
    ticketWindow.document.write(ticketHTML);
    ticketWindow.document.close();
  };

  if (loading) {
    return (
      <div>
        <MainNav />
        <div className="success-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Verifying your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <MainNav />
        <div className="success-container">
          <div className="error-message">
            <div className="error-icon">❌</div>
            <h2>Payment Verification Issue</h2>
            <p>{error}</p>
            <button onClick={handleViewEvents} className="btn btn-primary">
              Return to Events
            </button>
          </div>
        </div>
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
            Your event booking has been confirmed and payment has been processed.
          </p>

          {booking && (
            <div className="booking-details">
              <h3>Booking Details</h3>
              <div className="detail-row">
                <span className="detail-label">Event:</span>
                <span className="detail-value">{booking.event?.eventTitle || "Event"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Customer:</span>
                <span className="detail-value">{booking.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{booking.customerEmail}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tickets:</span>
                <span className="detail-value">{booking.ticketsBooked}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Booking Date:</span>
                <span className="detail-value">
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value status-confirmed">Confirmed</span>
              </div>
            </div>
          )}

          <div className="success-actions">
            <button onClick={handleDownloadTicket} className="btn btn-success">
              Download Ticket
            </button>
            <button onClick={handleViewEvents} className="btn btn-secondary">
              Browse More Events
            </button>
          </div>

          {/* Venue Map Section */}
          {booking?.event && (
            <div className="venue-section">
              <h3 className="venue-section-title">📍 Event Location</h3>
              <VenueMap event={booking.event} height="350px" />
            </div>
          )}

          <div className="success-info">
            <p>
              <strong>Important:</strong> Please check your email for a confirmation 
              message with your ticket details. You may also need to show this 
              confirmation at the event entrance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;
